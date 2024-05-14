from typing import List

import torch

from nearest_key_lookup import NearestKeyLookup
from ns_tokenizers import KeyboardTokenizerv1, CharLevelTokenizerv2
from word_generators import BeamGenerator, GreedyGenerator
from model import get_m1_bigger_model
from transforms import EncoderFeaturesGetter


class Predictor:
    # def __init__(self, word_generator_name: str, model_name: str,
    #              model_weights: str, transform_name: str) -> None:
    #     pass

    def predict(self, x: List[int], y: List[int], t: List[int]) -> List[str]:
        gname = "extra"

        nkl = NearestKeyLookup.load_state('nearest_key_lookup_state.pkl')
        kb_tokenizer = KeyboardTokenizerv1()
        char_tokenizer = CharLevelTokenizerv2('./static/voc.txt')
        grid_name_to_nk_lookup = {"extra": nkl}
        grid_name_to_wh={"extra": (1080, 667)}

        feats_extractor = EncoderFeaturesGetter(
            grid_name_to_nk_lookup=grid_name_to_nk_lookup,
            grid_name_to_wh=grid_name_to_wh,
            kb_tokenizer=kb_tokenizer,
            include_time=False,
            include_velocities=True,
            include_accelerations=True,
            kb_tokens_dtype=torch.int32,
        )

        model = get_m1_bigger_model('cpu','./static/m1_bigger_v2__2023_11_12__20_38_47__0.13129__greed_acc_0.86130__extra_l2_0_ls0_switch_2.pt')
        bg = BeamGenerator(model, char_tokenizer, 'cpu')

        traj_feats, kb_tokens = feats_extractor(x, y, t, gname)
       
        preds = bg(traj_feats, kb_tokens, max_steps_n=20, return_hypotheses_n=4, beamsize=4)

        return [pred for prob, pred in preds]
    