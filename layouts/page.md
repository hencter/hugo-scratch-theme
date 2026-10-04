{{- /*
  page.md — the Markdown mirror of a single page.

  Emitted by the `md` output format at /section/page/index.md. This is the
  single cheapest thing a site can do for agents: instead of parsing 20 KB of
  HTML to find the prose, an agent fetches the source Markdown with the front
  matter already normalised.

  `isPlainText = true` on the output format makes Hugo render this with
  text/template, so nothing here is HTML-escaped. The metadata block is built as
  a data structure and handed to `transform.Remarshal`, which guarantees valid
  YAML — hand-written `key: "{{ .Title }}"` breaks the moment a title contains a
  quote.
*/ -}}
{{- $tags := slice -}}
{{- range .GetTerms "tags" }}{{ $tags = $tags | append .LinkTitle }}{{ end -}}
{{- $categories := slice -}}
{{- range .GetTerms "categories" }}{{ $categories = $categories | append .LinkTitle }}{{ end -}}

{{- $meta := dict
      "title" .Title
      "linkTitle" .LinkTitle
      "description" .Description
      "url" .Permalink
      "section" .Section
      "language" site.Language.Locale
      "wordCount" .WordCount
      "readingTime" .ReadingTime
      "tags" $tags
      "categories" $categories -}}
{{- if not .Date.IsZero }}{{ $meta = merge $meta (dict "date" (.Date.Format "2006-01-02")) }}{{ end -}}
{{- if not .Lastmod.IsZero }}{{ $meta = merge $meta (dict "lastmod" (.Lastmod.Format "2006-01-02")) }}{{ end -}}
{{- with .Params.difficulty }}{{ $meta = merge $meta (dict "difficulty" .) }}{{ end -}}
{{- with .Params.estimatedTime }}{{ $meta = merge $meta (dict "estimatedTime" .) }}{{ end -}}
{{- with .Params.prerequisites }}{{ $meta = merge $meta (dict "prerequisites" .) }}{{ end -}}
{{- with .Params.outcomes }}{{ $meta = merge $meta (dict "outcomes" .) }}{{ end -}}
{{- if gt (len .AllTranslations) 1 -}}
  {{- $translations := slice -}}
  {{- range .AllTranslations }}{{ $translations = $translations | append (dict "language" .Language.Locale "url" .Permalink) }}{{ end -}}
  {{- $meta = merge $meta (dict "translations" $translations) -}}
{{- end -}}
---
{{ $meta | transform.Remarshal "yaml" }}---

# {{ .Title }}

{{ with .Description }}{{ . }}

{{ end -}}
{{ .RawContent }}
