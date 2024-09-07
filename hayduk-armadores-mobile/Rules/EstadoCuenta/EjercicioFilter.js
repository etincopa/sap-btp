
var clientAPI;

/**
 * Describe this function...
 */
export default function EjercicioFilter(clientAPI) {

    var now = new Date().toISOString().substr(0,4);
    now = Number(now);
    const oFilterProperty = {
        caption: "Ejercicio",
        name: "IDEjercicio",
        values: [
            {
                DisplayValue: "2011",
                ReturnValue: "2011"
            }
        ]
    };

    const aValues = [];
    for (let i = 0; i < 5; i++) {
        let iValue = now - i;
        aValues.push(
            {
                DisplayValue: iValue.toString(),
                ReturnValue: iValue.toString()
            }
        );
    }
    oFilterProperty.values = aValues;

    return oFilterProperty;
}