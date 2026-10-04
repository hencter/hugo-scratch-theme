+++
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
date = '{{ .Date }}'
draft = true
description = ''
tags = []
categories = []
+++

<!--
  Archetype: default
  Created with: hugo new content <path>/{{ .File.ContentBaseName }}.md

  Conventions the theme relies on:
    · Body starts at the "##" level — the template already renders the page <h1>.
    · Anything a reader needs in order to judge the page (difficulty, time,
      outcomes) belongs in the front matter, not in prose, so an agent can read
      it without parsing HTML.
-->
