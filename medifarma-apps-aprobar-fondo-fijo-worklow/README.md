# medifarma-apps-aprobar-fondo-fijo-worklow

## Deploy commands

```
> cf login --sso -o everis-peru-demo -s apps
> mbt build && cf deploy mta_archives/rendicion_gastos_wf_caja_chica_0.0.1.mtar -m workflow_caja_chica

> cd caja-chica-taskui && npm run build:cf && cd .. && cf html5-push caja-chica-taskui/dist 49bddadd-eaae-4cb0-b540-ae7b3fc33885
```