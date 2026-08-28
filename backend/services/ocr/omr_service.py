"""
OMR Service - Optical Mark Recognition for answer sheet evaluation.
Detects filled bubbles in MCQ answer sheets using OpenCV.
"""
import asyncio
import logging
from typing import Optional
from database.db import execute

logger = logging.getLogger("janbhasha.omr")


class OMRService:
    async def evaluate(
        self, image_path: str, answer_key: dict,
        total_questions: int = 10,
        teacher_id: Optional[int] = None,
        student_id: Optional[int] = None,
        worksheet_id: Optional[int] = None,
    ) -> dict:
        loop = asyncio.get_event_loop()
        detected = await loop.run_in_executor(None, lambda: self._detect_bubbles(image_path, total_questions))

        score = 0
        wrong = []
        results = {}
        for q_num in range(1, total_questions + 1):
            q_str = str(q_num)
            detected_ans = detected.get(q_str, "?")
            correct_ans = answer_key.get(q_str, "")
            is_correct = detected_ans == correct_ans
            results[q_str] = {"detected": detected_ans, "correct": correct_ans, "is_correct": is_correct}
            if is_correct:
                score += 1
            else:
                wrong.append(q_num)

        percentage = round((score / total_questions) * 100, 1) if total_questions > 0 else 0

        # Save result
        if teacher_id or student_id:
            import json
            try:
                await execute(
                    """INSERT INTO omr_results (teacher_id, student_id, worksheet_id, image_path,
                       answers_detected, answer_key, score, max_score, wrong_questions)
                       VALUES (?,?,?,?,?,?,?,?,?)""",
                    (teacher_id, student_id, worksheet_id, image_path,
                     json.dumps(detected), json.dumps(answer_key), score, total_questions, json.dumps(wrong))
                )
            except Exception as e:
                logger.warning(f"Could not save OMR result: {e}")

        return {
            "score": score,
            "max_score": total_questions,
            "percentage": percentage,
            "results": results,
            "wrong_questions": wrong,
            "grade": self._get_grade(percentage),
        }

    def _detect_bubbles(self, image_path: str, total_questions: int) -> dict:
        """Detect filled bubbles in OMR sheet using OpenCV contour analysis."""
        try:
            import cv2
            import numpy as np

            img = cv2.imread(image_path)
            if img is None:
                return {}

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            bubbles = []
            for c in contours:
                (x, y, w, h) = cv2.boundingRect(c)
                ar = w / float(h)
                area = cv2.contourArea(c)
                if 0.8 <= ar <= 1.2 and 200 < area < 5000:
                    bubbles.append((x, y, w, h, c))

            # Sort bubbles top-to-bottom, left-to-right
            bubbles.sort(key=lambda b: (b[1] // 30, b[0]))

            # Group into rows (each row = one question, typically 4-5 options A/B/C/D/E)
            options = ["A", "B", "C", "D", "E"]
            detected = {}
            cols = 4  # typical MCQ has 4 options
            for i in range(0, len(bubbles), cols):
                q_num = i // cols + 1
                if q_num > total_questions:
                    break
                row = bubbles[i:i + cols]
                best_filled = -1
                best_idx = -1
                for idx, (x, y, w, h, c) in enumerate(row):
                    mask = np.zeros(gray.shape, dtype="uint8")
                    cv2.drawContours(mask, [c], -1, 255, -1)
                    filled = cv2.countNonZero(cv2.bitwise_and(thresh, thresh, mask=mask))
                    if filled > best_filled:
                        best_filled = filled
                        best_idx = idx
                if best_idx >= 0 and best_idx < len(options):
                    detected[str(q_num)] = options[best_idx]

            return detected
        except Exception as e:
            logger.error(f"OMR bubble detection error: {e}")
            return {}

    def _get_grade(self, percentage: float) -> str:
        if percentage >= 90:
            return "A+"
        elif percentage >= 80:
            return "A"
        elif percentage >= 70:
            return "B+"
        elif percentage >= 60:
            return "B"
        elif percentage >= 50:
            return "C"
        elif percentage >= 40:
            return "D"
        return "F"
