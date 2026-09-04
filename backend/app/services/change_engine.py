import datetime
from typing import Dict, Any, List

class ChangeEngine:
    @staticmethod
    def calculate_change(
        symbol: str,
        company_name: str,
        previous_snapshot: Dict[str, Any],
        current_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Deterministic meaningful-change calculation.
        Compares previous snapshot with current data.
        """
        prev_price = float(previous_snapshot["price"])
        curr_price = float(current_data["current_price"])

        # Price percentage difference since last check
        if prev_price > 0:
            price_change_pct = round(((curr_price - prev_price) / prev_price) * 100.0, 2)
        else:
            price_change_pct = 0.0

        curr_volume = float(current_data.get("volume", 0.0))
        avg_volume = float(current_data.get("average_volume", curr_volume or 1.0))
        volume_ratio = round(curr_volume / avg_volume, 2) if avg_volume > 0 else 1.0

        abs_price_change = abs(price_change_pct)

        # Meaningful triggers:
        # 1. Absolute price change >= 3%
        # 2. Volume ratio >= 1.5
        price_meaningful = abs_price_change >= 3.0
        volume_unusual = volume_ratio >= 1.5
        meaningful = price_meaningful or volume_unusual

        # Deterministic Attention Score: 0 to 100
        # Price component: up to 60 points (e.g. 10% change gives 60 points, scaled linearly min 0 max 60)
        # 3% change gives 18 points, 5% gives 30 points, 10%+ gives 60 points
        price_points = min(60.0, (abs_price_change / 10.0) * 60.0)

        # Volume component: up to 40 points
        # If volume_ratio >= 1.0, scale up to 40 points at volume_ratio >= 2.5
        if volume_ratio > 1.0:
            vol_points = min(40.0, ((volume_ratio - 1.0) / 1.5) * 40.0)
        else:
            vol_points = 0.0

        attention_score = int(round(price_points + vol_points))
        attention_score = max(0, min(100, attention_score))

        # Attention levels:
        # 0–30 NORMAL
        # 31–60 WORTH WATCHING
        # 61–80 IMPORTANT
        # 81–100 HIGH ATTENTION
        if attention_score >= 81:
            attention_level = "HIGH ATTENTION"
        elif attention_score >= 61:
            attention_level = "IMPORTANT"
        elif attention_score >= 31:
            attention_level = "WORTH WATCHING"
        else:
            attention_level = "NORMAL"

        # Reasons generation (strictly factual, explaining WHAT changed)
        reasons: List[str] = []
        if price_meaningful:
            direction = "increased" if price_change_pct > 0 else "decreased"
            reasons.append(f"Price {direction} by {abs_price_change:.1f}% since your last check.")
        elif abs_price_change > 0.5:
            direction = "rose" if price_change_pct > 0 else "softened"
            reasons.append(f"Price {direction} slightly by {abs_price_change:.1f}% since your last check.")
        else:
            reasons.append("Price remained relatively stable since your last check.")

        if volume_unusual:
            reasons.append(f"Trading volume is {volume_ratio:.1f}× its recent average, indicating unusually high market activity.")
        else:
            reasons.append(f"Trading volume is normal ({volume_ratio:.1f}× average).")

        # Beginner explanation assembly
        direction_word = "increased" if price_change_pct >= 0 else "dropped"
        explanation_parts = []
        if price_meaningful and volume_unusual:
            explanation_parts.append(
                f"{symbol} {direction_word} {abs_price_change:.1f}% since your last check, paired with {volume_ratio:.1f}× average trading volume. High volume during a price shift shows strong market participation."
            )
        elif price_meaningful:
            explanation_parts.append(
                f"{symbol} {direction_word} {abs_price_change:.1f}% since your last check. A price move of 3% or more is a notable shift for beginners to investigate."
            )
        elif volume_unusual:
            explanation_parts.append(
                f"{symbol} is seeing {volume_ratio:.1f}× its usual trading volume. When a lot of shares change hands without large price movement, it often signals growing institutional interest."
            )
        else:
            explanation_parts.append(
                f"Nothing meaningful changed for {symbol} since your last check. Price moved {price_change_pct:+.1f}% on normal volume."
            )

        beginner_explanation = " ".join(explanation_parts)

        return {
            "symbol": symbol,
            "company_name": company_name,
            "current_price": curr_price,
            "previous_price": prev_price,
            "change_percent": price_change_pct,
            "current_volume": curr_volume,
            "average_volume": avg_volume,
            "volume_ratio": volume_ratio,
            "attention_score": attention_score,
            "attention_level": attention_level,
            "meaningful": meaningful,
            "reasons": reasons,
            "beginner_explanation": beginner_explanation,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "data_status": current_data.get("data_status", "fallback"),
        }
