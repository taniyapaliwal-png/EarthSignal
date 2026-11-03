import numpy as np


def calculate_ndvi(nir, red, valid_mask=None):
    """NDVI = (NIR - Red) / (NIR + Red).
    Invalid pixels become NaN (missing), never 0, so gaps are not shown as 'unchanged'."""
    nir = np.asarray(nir, dtype="float64")
    red = np.asarray(red, dtype="float64")

    total = nir + red
    ok = total != 0                      # avoid dividing by zero
    if valid_mask is not None:           # e.g. cloud/shadow mask: True = good pixel
        ok &= np.asarray(valid_mask, dtype=bool)

    ndvi = np.full(nir.shape, np.nan)    # start with everything "missing"
    ndvi[ok] = (nir[ok] - red[ok]) / total[ok]
    return ndvi


def valid_coverage(ndvi):
    """Fraction of pixels that have a real value."""
    return float(np.mean(~np.isnan(ndvi)))