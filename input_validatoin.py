from typing import Iterable, Tuple

def is_correct_keys(data) -> bool:
    proper_keys_set = {'x', 'y', 't'}
    received_keys_set = set(data.keys())

    if received_keys_set == proper_keys_set:
        return True, f"Keys set is equal to proper keys set: {proper_keys_set}"
    return False, f"Keys set should be equal to: {proper_keys_set}, but received: {received_keys_set}"

def is_proper_length(arr) -> bool:
    MAX_SEQ_LEN = 299  # app.config['PREDICTOR'].word_generator.model.pos_encoder.max_seq_len
    if len(arr) <= MAX_SEQ_LEN:
        return True, f"Swipe length is ok ({len(arr)})"
    return False, f"Swipe length is too long ({len(arr)})"


def is_input_valid(data) -> Tuple[bool, str]:
    dict_key_ok, dict_key_msg = is_correct_keys(data)
    if not dict_key_ok:
        return False, dict_key_msg
    
    x, y, t = data.get('x'), data.get('y'), data.get('t')

    for arr, arr_name in zip([x, y, t], ['x', 'y', 'z']):
        if not isinstance(arr, Iterable):
            return False, f"{arr_name} has unexpected type {type(arr)}"
        
    if not len(x) == len(y) == len(t):
        return False, f"Arrays x, y, t should hae same lenght; got { len(x), len(y), len(t)}"
    
    swipe_len_ok, swipe_len_msg = is_proper_length(x)
    if not swipe_len_ok:
        return False, swipe_len_msg
    
    # A separate loop to avoid theese itertions alltogether if an iterable is too long.
    for arr, arr_name in zip([x, y, t], ['x', 'y', 'z']):
        for el in arr:
            if type(el) != int:
                return False, f"{arr_name} has an element {el} of unexpected type {type(el)}"

    return True, "The input passed validation"
