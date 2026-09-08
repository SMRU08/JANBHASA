import unittest
from scripts.query_preprocessor import BilingualQueryPreprocessor
from scripts.clean_parallel_corpus import IndicCorpusCleaner

class TestJanbhashaPhase2(unittest.TestCase):
    def setUp(self):
        self.preprocessor = BilingualQueryPreprocessor()
        self.cleaner = IndicCorpusCleaner()

    def test_code_mixed_detection(self):
        query = "ᱡᱚᱦᱟᱨ! hospital kahan hai?"
        result = self.preprocessor.process_query(query)
        self.assertTrue(result["is_code_mixed"])
        self.assertIn("ol_chiki", result["detected_scripts"])
        self.assertIn("latin", result["detected_scripts"])

    def test_lexicon_normalization(self):
        query = "Main school ja raha hoon"
        result = self.preprocessor.process_query(query, target_lang="sat_Olck")
        # 'school' should be replaced by 'ᱤᱛᱩᱱ ᱟᱥᱲᱟ'
        self.assertIn("ᱤᱛᱩᱱ ᱟᱥᱲᱟ", result["normalized_query"])

    def test_cleaner_validation(self):
        # Good pair
        valid, reason = self.cleaner.is_valid_pair("नमस्ते", "ᱡᱚᱦᱟᱨ")
        self.assertTrue(valid)

        # Empty pair
        valid, reason = self.cleaner.is_valid_pair("", "ᱡᱚᱦᱟᱨ")
        self.assertFalse(valid)
        self.assertEqual(reason, "empty_sentence")

if __name__ == "__main__":
    unittest.main()
