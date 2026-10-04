{{- /*
  list.md — the Markdown mirror of a list page (home, section, taxonomy, term).

  Written with text/template (the `md` output format sets isPlainText), so the
  Markdown is not escaped. It carries the same front-matter shape as page.md so
  an agent can treat both uniformly.
*/ -}}
{{- $meta := dict
      "title" .Title
      "linkTitle" .LinkTitle
      "description" .Description
      "url" .Permalink
      "kind" .Kind
      "section" .Section
      "language" site.Language.Locale
      "pageCount" (len .Pages) -}}
{{- if not .Date.IsZero }}{{ $meta = merge $meta (dict "date" (.Date.Format "2006-01-02")) }}{{ end -}}
---
{{ $meta | transform.Remarshal "yaml" }}---

# {{ .Title }}

{{ with .Description }}{{ . }}

{{ end -}}
{{ .RawContent }}

## Pages

{{ range .Pages -}}
- [{{ .LinkTitle }}]({{ .Permalink }}){{ with .Description }} — {{ . }}{{ end }}
{{ end }}
