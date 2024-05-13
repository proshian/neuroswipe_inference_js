from typing import List

import torch

from nearest_key_lookup import NearestKeyLookup
from ns_tokenizers import KeyboardTokenizerv1, CharLevelTokenizerv2
from word_generators import BeamGenerator
from model import get_m1_bigger_model

def get_dx_dt(X, T):
    X = torch.tensor(X)
    T = torch.tensor(T)
    dx_dt = torch.zeros_like(X)
    dx_dt[1:len(X)-1] = (X[2:len(X)] - X[:len(X)-2]) / (T[2:len(X)] - T[:len(X)-2])
    return dx_dt

def predict(x: List[int], y: List[int], t: List[int]) -> List[str]:
    nkl = NearestKeyLookup.load_state('nearest_key_lookup_state.pkl')
    kb_tokenizer = KeyboardTokenizerv1()
    kb_labels = [nkl.get_nearest_kb_label(x_p, y_p) for x_p, y_p in zip(x,y)]
    kb_tokens = torch.tensor(
        [kb_tokenizer.get_token(l) for l in kb_labels], dtype = torch.int64)
    
    X = torch.tensor(x, dtype = torch.float32)
    Y = torch.tensor(y, dtype = torch.float32)
    T = torch.tensor(t, dtype = torch.float32)
    dXdt = get_dx_dt(X, T)
    dYdt = get_dx_dt(Y, T)
    d2Xdt2 = get_dx_dt(dXdt, T)
    d2Ydt2 = get_dx_dt(dYdt, T)

    xyt_lists = [X, Y, dXdt, dYdt, d2Xdt2, d2Ydt2]

    xyt = torch.cat([l.reshape(-1, 1) for l in xyt_lists], axis = 1)
    xyt[:, 0] = xyt[:, 0] / nkl.grid['width'] 
    xyt[:, 1] = xyt[:, 1] / nkl.grid['height']
    

    model = get_m1_bigger_model('cpu','./static/m1_bigger_v2__2023_11_12__20_38_47__0.13129__greed_acc_0.86130__extra_l2_0_ls0_switch_2.pt')
    char_tokenizer = CharLevelTokenizerv2('./static/voc.txt')

    bg = BeamGenerator(model, char_tokenizer, 'cpu')

    print(xyt)
    print(kb_tokens)

    preds = bg(xyt, kb_tokens, max_steps_n=20, return_hypotheses_n=4, beamsize=4)

    return [pred for prob, pred in preds]
