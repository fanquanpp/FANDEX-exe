---
order: 69
title: Python与Web爬虫
module: python
category: Python
difficulty: intermediate
description: Scrapy与BeautifulSoup
author: fanquanpp
updated: '2026-06-14'
related:
  - python/Python与NLP
  - python/Python与计算机视觉
  - python/Python与自动化
  - python/函数详解
prerequisites:
  - python/语法速查
---

## 1. BeautifulSoup

```python
from bs4 import BeautifulSoup
import requests

response = requests.get('https://example.com')
soup = BeautifulSoup(response.text, 'html.parser')
titles = [h2.text for h2 in soup.find_all('h2')]
```

## 2. Scrapy

```python
class QuotesSpider(scrapy.Spider):
  name = 'quotes'
  start_urls = ['https://quotes.toscrape.com']

  def parse(self, response):
    for quote in response.css('div.quote'):
      yield {'text': quote.css('span::text').get()}
```
