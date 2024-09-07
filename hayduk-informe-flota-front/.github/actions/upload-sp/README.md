# Upload to Sharepoint - GitHub Action

Este GitHub Action sube un archivo (instalador `.exe` de informe de flota) a una carpeta en SharePoint de Everis.

## Inputs

### `source-path`
**Required** File in the repository to upload.

### `sp-site-url`
**Required** Sharepoint site URL.

### `sp-destination-path`
**Required** Destination path in Sharepoint site.

### `file-name`
**Required** File name.

## Example usage
```
- name: Upload to Sharepoint action
  uses: ./.github/actions/upload-sp # Uses an action in  the root directory
  id: upload-sp
  with:
    source-path: 'dist\'
    sp-site-url: 'https://everisgroup.sharepoint.com sites/CompartidoExterno/'
    sp-destination-path: 'Documentos%20compartidos General/3.%20Hayduk/Informe%20de%20Flota/Instalador'
    file-name: 'Informe de Flota Setup ${{ github.ref }  exe'
  env:
    SP_USER: ${{ secrets.SP_USER }}
    SP_PASSWORD: ${{ secrets.SP_PASSWORD }}
```

## Test locally (TODO: no implementado aún)

Install [nektos/act](https://github.com/nektos/act)

`brew install nektos/tap/act`

