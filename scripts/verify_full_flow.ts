const API_URL = "http://localhost:3000/api";

async function run() {
  console.log("=== Starting MarketMate Full Flow Verification ===");

  const resetRes = await fetch(`${API_URL}/demo/reset-simulation`, { method: "POST" });
  if (!resetRes.ok) throw new Error("Could not reset simulation state");

  // 1. Register a fresh account so this check is repeatable.
  const testEmail = `verify-${Date.now()}@marketmate.local`;
  const loginRes = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "demopassword123",
      name: "Verification User",
    }),
  });
  if (!loginRes.ok) throw new Error("Test account registration failed: " + (await loginRes.text()));
  const loginData = await loginRes.json();
  const token = loginData.access_token;
  console.log("✓ Fresh test account registered. Virtual balance:", loginData.user.virtual_balance);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // 2. Query lessons
  const lessonsRes = await fetch(`${API_URL}/lessons`, { headers: authHeaders });
  const lessons = await lessonsRes.json();
  console.log(`✓ Retrieved ${lessons.length} curriculum lessons.`);
  if (lessons.length !== 6) throw new Error(`Expected 6 lessons, got ${lessons.length}`);

  // 3. Submit quiz for Lesson 1
  const quizRes = await fetch(`${API_URL}/lessons/1/complete`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ selected_option: 1 }), // Correct option: fractional ownership
  });
  const quizData = await quizRes.json();
  console.log("✓ Quiz completed. Correct:", quizData.quiz_correct);
  if (!quizData.quiz_correct) throw new Error("Quiz answer should be correct");

  // 4. Check progress summary
  const progRes = await fetch(`${API_URL}/lessons/progress/summary`, { headers: authHeaders });
  const progData = await progRes.json();
  console.log(`✓ Lesson progress: ${progData.completed_lessons}/${progData.total_lessons} (${progData.completion_percentage.toFixed(1)}%)`);

  // 5. Market Search
  const searchRes = await fetch(`${API_URL}/market/search?q=NVDA`);
  const searchResults = await searchRes.json();
  console.log(`✓ Search NVDA: found ${searchResults.length} result(s). Current price: ₹${searchResults[0].current_price}`);
  const nvdaPrice = searchResults[0].current_price;

  // 6. Portfolio Validation: Reject zero or negative quantity
  const badBuyRes = await fetch(`${API_URL}/portfolio/buy`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ symbol: "NVDA", quantity: 0 }),
  });
  if (badBuyRes.status !== 400) throw new Error("Zero quantity buy should be rejected with 400");
  console.log("✓ Portfolio validation: 0 quantity buy correctly rejected.");

  // 7. Atomic Buy 10 shares
  const buyRes = await fetch(`${API_URL}/portfolio/buy`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ symbol: "NVDA", quantity: 10 }),
  });
  if (!buyRes.ok) throw new Error("Buy failed: " + (await buyRes.text()));
  const buyData = await buyRes.json();
  console.log("✓ Buy executed:", buyData.message, "Remaining cash: ₹" + buyData.remaining_balance);

  // 8. Reject selling more than owned
  const badSellRes = await fetch(`${API_URL}/portfolio/sell`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ symbol: "NVDA", quantity: 999 }),
  });
  if (badSellRes.status !== 400) throw new Error("Selling more than owned should be rejected with 400");
  console.log("✓ Portfolio validation: Selling 999 shares when owning 10 correctly rejected.");

  // 9. Watchlist: Add NVDA
  await fetch(`${API_URL}/watchlist`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ symbol: "NVDA" }),
  });
  console.log("✓ Added NVDA to Watchlist.");

  // 10. Smart Watchlist: First visit check
  const smart1Res = await fetch(`${API_URL}/smart-watchlist/changes`, { headers: authHeaders });
  const smart1Data = await smart1Res.json();
  console.log("✓ Smart Watchlist check #1:", smart1Data.message, "Tracking started:", smart1Data.tracking_started);

  // 11. Trigger Simulation (Price +4.2%, Volume 1.8x)
  const simRes = await fetch(`${API_URL}/demo/simulate-change`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      symbol: "NVDA",
      price_delta_percent: 4.2,
      volume_multiplier: 1.8,
    }),
  });
  const simData = await simRes.json();
  console.log("✓ Simulated movement applied:", simData.message);

  // 12. Smart Watchlist: Verify Meaningful Detection
  const smart2Res = await fetch(`${API_URL}/smart-watchlist/changes`, { headers: authHeaders });
  const smart2Data = await smart2Res.json();
  const nvdaChange = smart2Data.items.find((i: any) => i.symbol === "NVDA");
  if (!nvdaChange) throw new Error("NVDA should be in smart watchlist items");
  console.log(`✓ Smart Watchlist detected change for NVDA:`);
  console.log(`  - Previous Price: ₹${nvdaChange.previous_price}`);
  console.log(`  - Current Price: ₹${nvdaChange.current_price} (${nvdaChange.change_percent >= 0 ? "+" : ""}${nvdaChange.change_percent}%)`);
  console.log(`  - Volume Ratio: ${nvdaChange.volume_ratio}× normal`);
  console.log(`  - Meaningful Flag: ${nvdaChange.meaningful}`);
  console.log(`  - Attention Level: ${nvdaChange.attention_level} (${nvdaChange.attention_score}/100)`);
  console.log(`  - Factual Reasons:`, nvdaChange.reasons);
  console.log(`  - Beginner Interpretation:`, nvdaChange.beginner_explanation);

  if (!nvdaChange.meaningful) throw new Error("NVDA change should be marked as meaningful (≥3% or ≥1.5x volume)");

  // 13. Atomic Sell 5 shares
  const sellRes = await fetch(`${API_URL}/portfolio/sell`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ symbol: "NVDA", quantity: 5 }),
  });
  const sellData = await sellRes.json();
  console.log("✓ Atomic Sell executed:", sellData.message, "Remaining cash: ₹" + sellData.remaining_balance);

  // 14. Verify Portfolio State
  const portRes = await fetch(`${API_URL}/portfolio`, { headers: authHeaders });
  const portData = await portRes.json();
  const nvdaPos = portData.positions.find((p: any) => p.symbol === "NVDA");
  console.log("✓ Portfolio Summary:");
  console.log(`  - Available Cash: ₹${portData.virtual_balance}`);
  console.log(`  - Invested Capital: ₹${portData.invested_value}`);
  console.log(`  - Total Portfolio Value: ₹${portData.total_portfolio_value}`);
  console.log(`  - NVDA Shares Remaining: ${nvdaPos ? nvdaPos.quantity : 0} (expected 5)`);
  if (!nvdaPos || nvdaPos.quantity !== 5) throw new Error("Expected exactly 5 remaining NVDA shares");

  // 15. Check Transactions Log
  const txRes = await fetch(`${API_URL}/portfolio/transactions`, { headers: authHeaders });
  const txList = await txRes.json();
  console.log(`✓ Transaction Ledger contains ${txList.length} recorded atomic transactions:`);
  for (const t of txList) {
    console.log(`  - [${t.type}] ${t.quantity} ${t.symbol} @ ₹${t.price} = ₹${t.total}`);
  }

  console.log("====================================================");
  console.log("🎉 ALL END-TO-END VERIFICATION CHECKS PASSED 100%!");
  console.log("====================================================");
}

run().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
