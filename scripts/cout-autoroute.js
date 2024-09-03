// Data from : https://www.francetvinfo.fr/economie/automobile/infographies-prix-des-peages-visualisez-l-augmentation-des-tarifs-en-2023-autoroute-par-autoroute_5917970.html
const data = {
  rows: [
    {
      columns: [
        "A48 (Bourgoin-Jallieu - Grenoble)",
        "+10.5%",
        1.1666666666666667,
        1.0555555555555556,
      ],
    },
    {
      columns: [
        "A65 (Langon-Pau)",
        "+10.4%",
        1.5393419170243203,
        1.3948497854077253,
      ],
    },
    {
      columns: [
        "A14 (La Défense-Poissy)",
        "+9.9%",
        4.761904761904762,
        4.333333333333333,
      ],
    },
    { columns: ["A75 (Viaduc de Millau)", "+6.8%", 10.416666666666668, 9.75] },
    {
      columns: [
        "A88 (Sées-Falaise)",
        "+6.6%",
        1.9829787234042553,
        1.8595744680851065,
      ],
    },
    {
      columns: [
        "A28 (Rouen-Tours)",
        "+6.5%",
        1.4943895122764137,
        1.402955227196978,
      ],
    },
    {
      columns: [
        "A404 (Saint-Martin-du-Fresne - Oyonnax)",
        "+6.2%",
        2.4285714285714284,
        2.285714285714286,
      ],
    },
    {
      columns: [
        "A68 (Toulouse - Montastruc-la-Conseillère)",
        "+6.2%",
        1.5454545454545454,
        1.4545454545454548,
      ],
    },
    {
      columns: [
        "A9 (Orange-Perpignan)",
        "+6.2%",
        0.9722604884157795,
        0.9156543519098309,
      ],
    },
    {
      columns: [
        "A11 (Paris-Nantes)",
        "+5.8%",
        1.1714851485148516,
        1.1074257425742575,
      ],
    },
    {
      columns: [
        "A51 (Gap-Marseille)",
        "+5.8%",
        1.167816091954023,
        1.103448275862069,
      ],
    },
    {
      columns: [
        "A63 (Bordeaux-Hendaye)",
        "+5.8%",
        1.182498709344347,
        1.1177077955601447,
      ],
    },
    {
      columns: [
        "A64 (Toulouse-Bayonne)",
        "+5.8%",
        0.9310897435897436,
        0.8801510989010988,
      ],
    },
    {
      columns: [
        "A83 (Nantes-Niort)",
        "+5.8%",
        0.9990774907749077,
        0.9443419434194343,
      ],
    },
    {
      columns: [
        "A20 (Brive-Montauban)",
        "+5.6%",
        1.1352019785655398,
        1.0750206100577082,
      ],
    },
    {
      columns: [
        "A62 (Bordeaux-Toulouse)",
        "+5.6%",
        0.9936695724366957,
        0.9405354919053549,
      ],
    },
    {
      columns: [
        "A77 (Nemours-Nevers)",
        "+5.6%",
        1.1632653061224492,
        1.1020408163265307,
      ],
    },
    {
      columns: [
        "A7 (Lyon-Marseille)",
        "+5.5%",
        1.0554650421477652,
        1.000779202380109,
      ],
    },
    {
      columns: [
        "A8 (Aix-en-Provence - Menton)",
        "+5.4%",
        1.2781369482099407,
        1.2127215849843587,
      ],
    },
    {
      columns: [
        "A41 (Grenoble-Genève)",
        "+5.2%",
        1.5197132616487457,
        1.4447201543975738,
      ],
    },
    {
      columns: [
        "A10 (Paris-Bordeaux)",
        "+5.1%",
        1.0819414537624397,
        1.0293313158354187,
      ],
    },
    {
      columns: [
        "A39 (Dijon - Bourg-en-Bresse)",
        "+5%",
        0.8732758620689656,
        0.8318965517241379,
      ],
    },
    {
      columns: [
        "A61 (Toulouse-Narbonne)",
        "+5%",
        0.9892357373519913,
        0.9418729817007534,
      ],
    },
    {
      columns: [
        "A89 (Bordeaux-Lyon)",
        "+5%",
        1.136136321541026,
        1.0820522318947954,
      ],
    },
    {
      columns: [
        "A19 (Artenay-Sens)",
        "+4.9%",
        1.6530612244897958,
        1.5752078609221467,
      ],
    },
    {
      columns: [
        "A43 (Lyon-Tunnel du Fréjus)",
        "+4.9%",
        1.3631202172303136,
        1.298938533695384,
      ],
    },
    {
      columns: [
        "A1 (Paris-Lille)",
        "+4.8%",
        0.9645280690931524,
        0.92041949413942,
      ],
    },
    {
      columns: [
        "A36 (Beaune-Mulhouse)",
        "+4.8%",
        0.9450154162384379,
        0.9013360739979446,
      ],
    },
    {
      columns: [
        "A42 (Lyon - Pont-d'Ain)",
        "+4.8%",
        1.0704225352112675,
        1.0211267605633803,
      ],
    },
    {
      columns: [
        "A49 (Valence-Grenoble)",
        "+4.8%",
        1.3186119873817035,
        1.2586750788643533,
      ],
    },
    {
      columns: [
        "A5 (Paris-Langres)",
        "+4.8%",
        0.8273469387755101,
        0.789795918367347,
      ],
    },
    {
      columns: [
        "A13 (Paris-Caen)",
        "+4.7%",
        0.9626801330213081,
        0.9195713757851952,
      ],
    },
    {
      columns: [
        "A16 (Paris-Dunkerque)",
        "+4.7%",
        1.0016250427642832,
        0.9568936024632226,
      ],
    },
    {
      columns: [
        "A31 (Beaune-Nancy)",
        "+4.7%",
        0.8259911894273129,
        0.788546255506608,
      ],
    },
    {
      columns: [
        "A6 (Paris-Lyon)",
        "+4.7%",
        0.893785832676684,
        0.8534358612069669,
      ],
    },
    {
      columns: [
        "A71 (Orléans-Clermont-Ferrand)",
        "+4.7%",
        0.9434579026415763,
        0.9013163707041258,
      ],
    },
    {
      columns: [
        "A4 (Paris-Strasbourg)",
        "+4.6%",
        0.8992749054224464,
        0.8596311475409836,
      ],
    },
    {
      columns: [
        "A26 (Calais-Troyes)",
        "+4.5%",
        0.8552165564326862,
        0.8180072541071047,
      ],
    },
    {
      columns: [
        "A40 (Mâcon-Tunnel du mont Blanc)",
        "+4.5%",
        1.2199405566063226,
        1.1672520940286408,
      ],
    },
    {
      columns: [
        "A85 (Angers-Vierzon)",
        "+4.4%",
        1.0132248219735502,
        0.970498474059003,
      ],
    },
    {
      columns: [
        "A57 (Toulon - Le Cannet-des-Maures)",
        "+4.3%",
        1.846153846153846,
        1.7692307692307694,
      ],
    },
    {
      columns: [
        "A87 (Angers - La-Roche-sur-Yon)",
        "+4.3%",
        1.0359550561797755,
        0.9932584269662921,
      ],
    },
    {
      columns: [
        "A355 (Strasbourg)",
        "+4%",
        2.493150684931507,
        2.3972602739726026,
      ],
    },
    {
      columns: [
        "A81 (Le Mans-La Gravelle)",
        "+3.7%",
        1.0673076923076923,
        1.028846153846154,
      ],
    },
    {
      columns: [
        "A29 (Beuzeville - Saint-Quentin)",
        "+3.6%",
        1.0042501517911355,
        0.9696417729204614,
      ],
    },
    {
      columns: [
        "A66 (Villefranche-de-Lauragais - Pamiers)",
        "+3.2%",
        0.9701492537313433,
        0.9402985074626866,
      ],
    },
    { columns: ["A150 (Rouen-Yvetot)", "+2.8%", 2.3125, 2.25] },
    {
      columns: [
        "A50 (Marseille-Toulon)",
        "+2.7%",
        1.488562091503268,
        1.4493464052287583,
      ],
    },
    {
      columns: [
        "A54 (Nîmes - Salon-de-Provence)",
        "+2.7%",
        0.6987577639751552,
        0.6801242236024845,
      ],
    },
    {
      columns: [
        "A52 (Aix-en-Provence - Aubagne)",
        "+2.1%",
        1.3857142857142857,
        1.357142857142857,
      ],
    },
    {
      columns: [
        "A72 (Saint-Etienne - Nervieux)",
        "0%",
        0.9038461538461539,
        0.9038461538461539,
      ],
    },
    {
      columns: [
        "A2 (Combles-Cambrai)",
        "+0%",
        0.9999999999999999,
        0.9999999999999999,
      ],
    },
    { columns: ["A500 (Tunnel de Monaco)", "+0%", 6, 6] },
    { columns: ["A86 (Rueil-Vélizy)", "-6%", 10.9, 11.6] },
  ],
}

const total = data.rows.reduce((acc, row) => {
  return acc + row.columns[2]
}, 0)

console.log("Tarif moyen du km d'autoroute", total / data.rows.length / 10)
