import json

from nearest_key_lookup import NearestKeyLookup
from tokenizers import KeyboardTokenizerv1

if __name__ == "__main__":
    grids_path = '..\static\keyboardData.json'
    with open(grids_path, "r", encoding="utf-8") as f:
        grid = json.load(f)
    
    keyboard_selection_set = set(KeyboardTokenizerv1().i2t)
    nearest_key_lookup = NearestKeyLookup(grid, keyboard_selection_set)
    nearest_key_lookup.save_state('../nearest_key_lookup_state.pkl')
