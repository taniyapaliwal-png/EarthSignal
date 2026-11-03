import numpy as np
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from pipeline.ndvi import calculate_ndvi, valid_coverage


def test_known_value():
    result = calculate_ndvi([0.5], [0.1])
    assert np.isclose(result[0], 0.4 / 0.6)


def test_zero_sum_is_missing():
    result = calculate_ndvi([0.0], [0.0])
    assert np.isnan(result[0])


def test_mask_marks_pixels_missing():
    result = calculate_ndvi([0.5, 0.5], [0.1, 0.1], valid_mask=[True, False])
    assert not np.isnan(result[0])
    assert np.isnan(result[1])


def test_valid_coverage():
    result = calculate_ndvi([0.5, 0.5], [0.1, 0.1], valid_mask=[True, False])
    assert valid_coverage(result) == 0.5