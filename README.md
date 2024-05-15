the code is ugly, but it works

![demo](https://github.com/proshian/yandex-cup-2023-ml-neuroswipe/assets/98213116/02a5c230-7eac-486e-b848-911adb1b4c2b)

TODO:
* Refactor
* Add radiobuttons to choose model and decoding algorythm; add grid choice
    * Выбрать раскладку
    * Выбрать модель (модель = архитектура + метод предобработки данных + веса)
        * У модели можно вывести
            * график обучения с точкой на графике, соответствующей эпохе
            * значениия метрик на валидации
    * Выбрать метод декодирования (bs with voc, bs no voc, greedy voc, greedy no voc)
* Add a mouse / finger trail (like blue trail in gboard)
* Leave swipepoints connected with lines on screen until new  mousedown or touchstart event happens
* Resize keyboard when page is resized

Prepare:
``` sh
git clone https://github.com/proshian/yandex-cup-2023-ml-neuroswipe.git
cd yandex-cup-2023-ml-neuroswipe
git checkout embeding_experiments
cd ..
```
щ
If doesn't work try:
``` sh
cd yandex-cup-2023-ml-neuroswipe
git checkout c5e0a83eb962a68d6be1a6959b5e94ba178205b2
cd ..
```

Run: 

``` sh
python main.py
```

**В python from anywhere работает только странным костылем: в Predictor необходимо вынести все содержимое `__init__` в predict. Это можно сделать так:**
``` python
class Predictor:
    def setup(self) -> None:
        self.set_feats_extractor("traj_and_nearest")
        char_tokenizer = CharLevelTokenizerv2('./neuroswipe_inference_js/static/voc.txt')
        model = get_m1_bigger_model('cpu', './neuroswipe_inference_js/static/m1_bigger_v2__2023_11_12__20_38_47__0.13129__greed_acc_0.86130__extra_l2_0_ls0_switch_2.pt')
        with open('./neuroswipe_inference_js/static/voc.txt', 'r', encoding='utf-8') as f:
            vocab = f.read().splitlines()
        self.word_generator = BeamGenerator(model, char_tokenizer, 'cpu', vocab, 34)

    def __init__(self) -> None:
        self.set_feats_extractor("traj_and_nearest")


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
        if not hasattr(self, 'word_generator'):
            self.setup()

        gname = "extra"
        traj_feats, kb_tokens = self.feats_extractor(x, y, t, gname)
        preds = self.word_generator(traj_feats, kb_tokens, max_steps_n=25, return_hypotheses_n=4, beamsize=4)

        return [pred for prob, pred in preds]
```

Если создать модель в `__init__`, она будет бесконечно долго работать. Можно добавлением print непосредственно до и после вызова первого слоя энкодера трансформера понять, что мы никогда из этого вызова не выходим.

Такие проюлемы только в  python from anywhere. Локально проблем нет.

Я не пробовал, но  наверное, можно убрать setup из predict и вызвать на predictor'е метод setup перед ренедрингом html

Еще можно поробовать вернуть инициализацию в init, создать глобальную пустую переменную `predictor = None` (вместо текущего `predictor = Predictor()`), а при загрузке страницы перед рендерингом уже вызвать `predictor = Predictor()`

```python
predictor = None
app = Flask(__name__)
```

``` python
@app.route('/')
def index():
    predictor = Predictor()
    return render_template('index.html')
```

с точки зрения дизайна приложене может выглядеть так:
![design](design_idea.svg)