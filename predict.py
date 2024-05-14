from typing import List

import torch

from nearest_key_lookup import NearestKeyLookup
from ns_tokenizers import KeyboardTokenizerv1, CharLevelTokenizerv2
from word_generators import BeamGenerator, GreedyGenerator
from model import get_m1_bigger_model
from transforms import EncoderFeaturesGetter



# GENERATOR_NAME_TO_CTOR_AND_STATE = {
#     "beam": None,
#     "beam_with_vocab": None,
#     "greedy": None,
#     "greedy_with_vocab": None,
# }

GRID_NAME_TOK_NKL_STATE = {
    'extra': 'nearest_key_lookup_state.pkl'
}



class Predictor:
    # def __init__(self, word_generator_name: str, model_name: str,
    #              model_weights: str, transform_name: str) -> None:
    #     pass

    def __init__(self) -> None:
        self.set_feats_extractor("traj_and_nearest")
        self.model = get_m1_bigger_model('cpu','./static/m1_bigger_v2__2023_11_12__20_38_47__0.13129__greed_acc_0.86130__extra_l2_0_ls0_switch_2.pt')
        char_tokenizer = CharLevelTokenizerv2('./static/voc.txt')
        self.word_generator = BeamGenerator(self.model, char_tokenizer, 'cpu')

    # def set_word_generator(self, generator_name) -> None:
    #     assert generator_name in GENERATOR_NAME_TO_CTOR_AND_STATE
    #     ctor, state = GENERATOR_NAME_TO_CTOR_AND_STATE[generator_name]
    #     self.word_generator = ctor.load_state(state)

    def set_feats_extractor(self, feats_extractor_name) -> None:
        if feats_extractor_name == "traj_and_nearest":
            grid_name_to_nk_lookup = {
                gname: NearestKeyLookup.load_state(state_path)
                for gname, state_path in GRID_NAME_TOK_NKL_STATE.items()
            }
            kb_tokenizer = KeyboardTokenizerv1()
            grid_name_to_wh={"extra": (1080, 667)}
            self.feats_extractor = EncoderFeaturesGetter(
                grid_name_to_nk_lookup=grid_name_to_nk_lookup,
                grid_name_to_wh=grid_name_to_wh,
                kb_tokenizer=kb_tokenizer,
                include_time=False,
                include_velocities=True,
                include_accelerations=True,
                kb_tokens_dtype=torch.int32,
            )


    def predict(self, x: List[int], y: List[int], t: List[int]) -> List[str]:
        gname = "extra"
        traj_feats, kb_tokens = self.feats_extractor(x, y, t, gname)
        preds = self.word_generator(traj_feats, kb_tokens, max_steps_n=20, return_hypotheses_n=4, beamsize=4)

        return [pred for prob, pred in preds]
    