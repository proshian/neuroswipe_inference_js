works only on mobile devices (it's the nature of touch events)

the code is ugly, but it works

TODO:
* Refactor
* Add pytorch model thata predicts the word
* Leave swipepoints connected with lines on screen until new  mousedown or touchstart event happens
* Resize keyboard when page is resized

Prepare:
``` sh
git clone https://github.com/proshian/yandex-cup-2023-ml-neuroswipe.git
cd yandex-cup-2023-ml-neuroswipe
git checkout embeding_experiments
cd ..
```

Run: 

``` sh
python main.py
```

сравнить validation dataset и данные генерирующиеся в predict для одной кривой