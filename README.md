# Neuroswipe web


A keyboard demonstration that uses a neural network from [neuroswipe project](https://github.com/proshian/neuroswipe) to decode swipes into words


![demo](https://github.com/proshian/neuroswipe/assets/98213116/4f3f5d7d-833b-41ae-8c67-288bfd1f5b54)

The demostration is running on [https://proshian.pythonanywhere.com/](https://proshian.pythonanywhere.com/)

# Launching

## Locally

Prepare the repository:

Clone neuroswipe project to the root of this demonstration project 

``` sh
git clone https://github.com/proshian/yandex-cup-2023-ml-neuroswipe.git
cd yandex-cup-2023-ml-neuroswipe
# git checkout embeding_experiments
git checkout c5e0a83eb962a68d6be1a6959b5e94ba178205b2
cd ..
```

Install requirements for neuroswipe project:
``` sh 
pip install -r yandex-cup-2023-ml-neuroswipe/requirements.txt
```


Run locally: 

``` sh
python main.py
```

## Setting up a server on pythonanywhere.com

If you are trying to run this on pythonanywhere you won't be able to install requirements but the project works with library versions that already present there are

There are two extra steps that you need to do when launching in pythonanywhere: 

1. Your /var/www/{USERNAME}_pythonanywhere_com_wsgi.py file should look like this
``` python
# This file contains the WSGI configuration required to serve up your
# web application at http://<your-username>.pythonanywhere.com/
# It works by setting the variable 'application' to a WSGI handler of some
# description.
#
# The below has been auto-generated for your Flask project

import sys

# # add your project directory to the sys.path
PROJECT_HOME = '/home/USERNAME/neuroswipe_inference_js/'
if PROJECT_HOME not in sys.path:
    sys.path = [PROJECT_HOME] + sys.path

neuroswipe_dir_src = PROJECT_HOME + 'yandex-cup-2023-ml-neuroswipe/src'
if neuroswipe_dir_src not in sys.path:
    sys.path = [neuroswipe_dir_src] + sys.path


# import flask app but need to call it "application" for WSGI to work
from main import app as application  # noqa
```

Don't forget to chenge PROJECT_HOME and USERNAME and maybe neuroswipe_dir_src if the name of that repo changed


2. You have to change a block of code in ./yandex-cup-2023-ml-neuroswipe/src/word_generators.py:

Before:
``` python
    def _mask_out_unallowed_ids(self, prefix_ids: List[int], logits: Tensor
                                ) -> Tensor:
        if self.prefix_to_allowed_ids is None:
            return logits
        unallowed_ids = self._get_unallowed_token_ids(prefix_ids)
        logits[torch.tensor(list(unallowed_ids), dtype = torch.int)] = float('-inf')
        return logits
```

After:
``` python
    def _mask_out_unallowed_ids(self, prefix_ids: List[int], logits: Tensor
                                ) -> Tensor:
        if self.prefix_to_allowed_ids is None:
            return logits
        unallowed_ids = self._get_unallowed_token_ids(prefix_ids)
        logits[torch.tensor(list(unallowed_ids), dtype = torch.long)] = float('-inf')
        return logits
```


с точки зрения дизайна приложене планируется таким:

![design](./readme_assets/design_idea.svg)

# TODO:
* Add radiobuttons to choose model and decoding algorithm; add grid choice
    * Выбрать раскладку
    * Выбрать модель (модель = архитектура + метод предобработки данных + веса)
        * У модели можно вывести
            * график обучения с точкой на графике, соответствующей эпохе
            * значениия метрик на валидации
    * Выбрать метод декодирования (bs with voc, bs no voc, greedy voc, greedy no voc)
* Set an option to leave numbered swipepoints connected with lines on screen until new  mousedown or touchstart event happens
* Maybe make curor trace points size depended on the `keyboard` div size 
* Maybe make cursor trace visible only when a swipe was started on keyboard element
* Maybe make word_candidates opacity dependant on the word probability
* Replace `predictions` div with `results` div. The div will contain either `predictions` div or `error` div depending on server response   
* Make sure everything is in right folders (all elements of static and templates are where they belong) 

# Any comments / adice on enhancements are very welcome in github issues :)

If you've got an idea on how to enhance this demonstration in any way; if you've found flaws in the code please let me know, I would be very greatful :)

