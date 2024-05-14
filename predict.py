from typing import List

import torch

from nearest_key_lookup import NearestKeyLookup
from ns_tokenizers import KeyboardTokenizerv1, CharLevelTokenizerv2
from word_generators import BeamGenerator, GreedyGenerator
from model import get_m1_bigger_model
from transforms import FullTransform


# def get_transforms(gridname_to_grid_path: str,
#                    grid_names: List[str],
#                    transform_name: str,
#                    char_tokenizer: KeyboardTokenizerv1,
#                    uniform_noise_range: int = 0,
#                    dist_weights_func: Optional[Callable] = None,
#                    ds_paths_list: Optional[List[str]] = None,
#                    totals: Tuple[Optional[int], Optional[int]] = (None, None)
#                    ) -> Tuple[Callable, Callable]:



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

        full_transform = FullTransform(
            grid_name_to_nk_lookup=grid_name_to_nk_lookup,
            grid_name_to_wh=grid_name_to_wh,
            kb_tokenizer=kb_tokenizer,
            word_tokenizer=char_tokenizer,
            include_time=False,
            include_velocities=True,
            include_accelerations=True,
            kb_tokens_dtype=torch.int32,
            word_tokens_dtype=torch.int64
        )

        model = get_m1_bigger_model('cpu','./static/m1_bigger_v2__2023_11_12__20_38_47__0.13129__greed_acc_0.86130__extra_l2_0_ls0_switch_2.pt')
        bg = BeamGenerator(model, char_tokenizer, 'cpu')

        model_in, dec_out = full_transform((x, y, t, gname, None))
        traj_feats, kb_tokens, decoder_in = model_in

        preds = bg(traj_feats, kb_tokens, max_steps_n=20, return_hypotheses_n=4, beamsize=4)

        return [pred for prob, pred in preds]
    