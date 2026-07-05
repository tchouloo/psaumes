// ============================================================================
//  PSAUMES — Configuration du recueil
// ============================================================================
//
//  C'EST ICI QUE TOUT SE PERSONNALISE.
//
//  Chaque chapitre a :
//    - title    : le titre affiché une fois le texte déverrouillé
//    - riddle   : la devinette posée (sur toi !)
//    - hint     : un indice qu'elle peut demander
//    - answers  : la ou les réponses acceptées
//    - text     : le poème
//
//  ⚠️  LES DEVINETTES ET RÉPONSES CI-DESSOUS SONT DES EXEMPLES.
//      Remplace-les par de vraies devinettes sur toi avant de publier,
//      puis relance :  node tools/build.mjs
//
//  Les réponses sont tolérantes : majuscules, accents, espaces et tirets
//  sont ignorés ("Saint-Louis" = "saint louis" = "SAINTLOUIS").
//  Tu peux mettre plusieurs réponses acceptées : answers: ["dakar", "la médina"]
//
// ============================================================================

export const settings = {
  // Titre du site
  siteTitle: "Psaumes",
  // Son prénom doux — le site s'adresse à elle (« bonsoir, Lathiri… »)
  beloved: "Lathiri",
  // Dédicace affichée sur la page d'accueil
  dedication: "Onze textes. Onze clés. Chaque clé est un souvenir de nous.",
  // true  : les textes se déverrouillent dans l'ordre (un voyage)
  // false : elle peut essayer n'importe quel texte à tout moment
  sequential: true,

  // Compte à rebours avant l'ouverture du recueil entier.
  // null = ouvert tout de suite. Ex : "2026-07-20T20:00:00"
  opensAt: null,

  // Une porte par jour : la porte I s'ouvre ce jour-là, la II le lendemain…
  // null = pas de rythme quotidien. Ex : "2026-07-20"
  dailyFrom: null,

  // Le vrai ciel du soir de votre rencontre : les étoiles brillantes sont
  // dessinées à leur position réelle pour cette date, cette heure et ce lieu.
  // null = ciel décoratif. ⚠️ EXEMPLE ci-dessous (Dakar) : mets VOTRE soir.
  sky: { date: "2025-06-21T21:30:00", lat: 14.6928, lon: -17.4467 },
};

export const chapters = [
  // --------------------------------------------------------------- I
  {
    title: "Le courage d'aimer",
    stage: "Le seuil",
    mapNote: "Là où tout commence : oser le dire.",
    riddle: "Pour ouvrir ce recueil : quel est le prénom de celui qui t'écrit ?",
    hint: "Celui que tu prononces quand tu me cherches des yeux.",
    answers: ["EXEMPLE-MON-PRENOM"], // ⚠️ mets ton prénom ici
    text: `Il y’a de ces amours que l’on peut exprimer
Pour lesquels on persiste dans l’échec en les chantant.

Mais quels échecs ! Quels bonheurs !

Ces amours qui ne sont plus des sentiments parce que s’étant accomplis dans le temps, l’espace.
Parce que confondus avec notre chair.

Quelle douleur insupportable pour toi qui essaies de les camoufler ou pire de t’en purifier.

Quel bonheur pour toi qui l’acceptes et qui n’hésites pas à t’abandonner dans cet amour au point de ne plus exister en tant qu’être, individu.
Quand il s’accomplit, il est Amour, autrement, il est désarroi.

Quel courage et pourtant quelle évidence que de dire je t’aime.
Toi qui nourris mon âme et qui éclaires mon cœur.`,
  },

  // --------------------------------------------------------------- II
  {
    title: "La chute",
    stage: "La chute",
    mapNote: "Le jour où j'ai cessé de me tenir debout.",
    riddle: "Dans quelle ville nos regards se sont-ils croisés pour la première fois ?",
    hint: "Ferme les yeux. Tu y es encore.",
    answers: ["EXEMPLE-VILLE"], // ⚠️ ex : ["dakar"]
    text: `On dit tomber amoureux.
Mais on tombe de quoi.
On tombe d’où.

On ne tombe que si l’on était debout.
On ne chute que lorsqu’on tenait encore.
Alors aimer, ce serait déjà perdre une hauteur.

Ou bien consentir à ne plus se soutenir soi-même.

Tomber, ce n’est pas toujours glisser.
Parfois c’est ouvrir les mains.

Et ouvrir les mains,
c’est accepter que quelque chose puisse partir.
Ou entrer.

C’est cela, peut-être, la vulnérabilité de l’amour.

Dire je t’aime semble pauvre.
Deux syllabes.
Presque rien.
Aucune noblesse apparente.
Aucun éclat de rhétorique.

Et pourtant, ce sont parmi les mots les plus lourds qu’un être humain puisse porter.

Parce que ce n’est plus un mot.
C’est un dépôt.
Un abandon.
Une signature invisible au bas de soi-même.

Ces sentiments,
à la fois beaux et cruels,
ne naissent pas dans le dictionnaire.

Ce sont des mots qui n’existent pas encore,
qui se forment dans la poitrine,
dans un lieu sans alphabet.

On les désire avant de les comprendre.
On les cherche avant de les vivre.
On les prononce avant de savoir ce qu’ils vont nous coûter.

Alors qu’est-ce qu’aimer.
Est-ce ressentir.
Ou est-ce consentir.

Quand on tombe,
on croit être amoureux.

Mais l’est-on vraiment.

Ou bien est-on simplement
en train d’accepter
de ne plus être entier seul.

✦

On dit tomber amoureux.
Mais certaines chutes ne viennent pas de la gravité.
Elles viennent d’un appel.

Avant toi,
je marchais droit,
mais je marchais vide.

Puis ton nom a traversé mon silence
comme une lumière qui n’avait pas demandé la permission.

Je n’ai pas glissé vers toi.
J’ai été convoqué.

Comme si, bien avant ma naissance,
une phrase avait été écrite quelque part,
et que cette phrase contenait ton visage.

Aimer,
ce n’est pas posséder.
Ce n’est même pas choisir.

C’est reconnaître.

Reconnaître une âme
qui parle une langue plus ancienne que les mots.

Quand je dis je t’aime,
ce n’est pas ma bouche qui parle.

C’est quelque chose en moi
qui se souvient.

Je t’aime
comme on se souvient d’une patrie jamais visitée.
Comme on se souvient d’un ciel perdu.

Je t’aime
non pas parce que tu complètes mes manques,
mais parce que tu révèles mes profondeurs.

Tu n’es pas arrivée dans ma vie.
Tu t’y es révélée.

Comme un secret que Dieu n’avait pas encore dévoilé.

Si je tombe,
ce n’est pas vers le bas.

Je tombe vers l’intérieur.
Je tombe vers ce que je suis vraiment
quand ton regard me traverse.

Être amoureux,
ce n’est pas brûler.

C’est être lentement transfiguré.

C’est sentir son cœur apprendre un nouveau rythme.
Un rythme qui ne lui appartenait pas.

Alors si je tombe,
que ce soit encore.

Et encore.

Parce que chaque chute vers toi
est une élévation déguisée.

Et si aimer est une prière,
alors tu es la mienne.`,
  },

  // --------------------------------------------------------------- III
  {
    title: "Parce que toi",
    stage: "Le choix",
    mapNote: "Je te choisis, encore et encore.",
    riddle: "Quel mois de l'année nous a réunis ?",
    hint: "Regarde nos premiers messages…",
    answers: ["EXEMPLE-MOIS"], // ⚠️ ex : ["septembre"]
    text: `Parce que tu es pleine de vie.
Parce que ma vie s’éclaire quand tu respires.

Parce que la vie mérite d’être célébrée.
Parce qu’elle porte ton nom.

Parce que la mort n’est pas la fin.
Parce que ton regard me rappelle l’éternité.

Parce que tu peux tomber, douter, te perdre parfois.
Parce que ta renaissance, sans fin, n’est que plus belle.
Parce que je veux être ton appui, ton échelle douce, celle qui ne blesse pas les pieds.

Parce que la vie n’est qu’une suite de choix.
Parce que je te choisis, encore et encore.

Parce que la vie est une guidance divine.
Parce que ton chemin croise le mien.
Parce que je t’ai choisie sans calcul, sans peur, sans réserve.
Parce que, je l’espère, Dieu nous a choisis l’un pour l’autre, dans le secret de Ses desseins.

Puisses-tu célébrer ta vie, à chaque instant.
Puissé-je baigner dans les mers infinies de ta célébration.`,
  },

  // --------------------------------------------------------------- IV
  {
    title: "Soleil de mon âme",
    stage: "L'aurore",
    mapNote: "Ta lumière s'est levée sur mes jours.",
    riddle: "Quelle est ma couleur préférée ?",
    hint: "Celle que je porte quand je veux te plaire.",
    answers: ["EXEMPLE-COULEUR"], // ⚠️ ex : ["bleu", "bleu nuit"]
    text: `Dans ton regard je me perds.
Dans ton regard je me trouve.

Que peuvent bien faire les êtres privés de la lumière salvatrice du soleil ?
Comment le monde apprendrait-il encore le chemin de l’aurore ?

Que ne s’embrase donc le cœur au contact de ta chaleur ?
Car même la création semble connaître ton nom.

Le coq élève son chant, comme une prière annonçant ton arrivée.
Les oiseaux chantent ta beauté au contact de ta lumière éclatante.

La rose déploie lentement ses pétales, offrant à ta lumière le plus silencieux de ses hommages.

Et moi, que pourrais-je faire, sinon joindre ma voix à ce concert ?
Car dans ton regard je me perds,
et c’est précisément là que je me retrouve.
Soleil de mon âme.
Lumière sur lumière.

Grâce soit rendue à Dieu,
qui a semé tant de beauté dans une seule de Ses créatures.

Qu’Il ne cesse de nous enivrer de ta beauté.
De ton âme plus pure que le zam-zam.`,
  },

  // --------------------------------------------------------------- V
  {
    title: "La visiteuse",
    stage: "La visite",
    mapNote: "Quand tu frappes à ma porte.",
    riddle: "Quel est mon plat préféré, celui que je réclame toujours ?",
    hint: "Tu me taquines à chaque fois que j'en reprends…",
    answers: ["EXEMPLE-PLAT"], // ⚠️ ex : ["thieboudienne", "ceebu jen"]
    text: `Elle a (encore) frappé à ma porte aujourd’hui.
Telle une cigale, elle inspire grâce, quiétude et délicatesse.
Elle n’est que douceur.
Noblesse, elle incarne. Et quel charisme…
Oh toi, Leyla, prunelle de mes yeux, ta beauté céleste m’a une fois de plus inspiré.
Laisse-moi puiser un peu de ta lumière pour chanter la plus belle créature qui soit.
Les Houris du paradis, les Valkyries elles-mêmes jalousent ta grâce — qu’elles tentent d’imiter sous toutes ses formes.
Je prie le Seigneur, seul exauceur des vœux, garant des plus sincères, de considérer le mien :
Puisse-t-Il nous accorder de vivre, infiniment, de cet amour.`,
  },

  // --------------------------------------------------------------- VI
  {
    title: "La légende",
    stage: "La légende",
    mapNote: "Ton nom, chanté parmi les mythes.",
    riddle: "Quel surnom je te donne quand nous sommes seuls ?",
    hint: "Il est dans ce recueil, quelque part…",
    answers: ["EXEMPLE-SURNOM"], // ⚠️ ex : ["leyla"]
    text: `Ne t’en rends-tu toujours pas compte ?
Abandonne, c’est mieux pour ton salut.
Prête l’oreille aux murmures d’une âme éprouvée,
Et exulte de la grandeur sacrée de cet échec,
Car ton audace t’a valu d’être évoquée
Là où l’on chante les légendes de Ghays, Majnoun Layla,
Mythes d’un amour transcendant l’Orient et l’Occident.

Rokhaya ou Ruqaya,
Ton nom seul suffit pleinement.
Tu incarnes, dans toute ta splendeur, l’essence même de cette noblesse,
Aucun autre ne saurait égaler ta magnificence.

Tel le rossignol, messager des cieux étoilés,
Dont le chant épique défie l’infini,
Nous découvrons dans tes épreuves
L’écho d’un mythe éternel.
Nous élèverons ta beauté en hymnes célestes,
Déclamant avec le lyrisme qui défie le temps,
Car seul l’art du vers peut célébrer
L’infiniment beau et l’infiniment gracieux,
Même si le récit de ta splendeur s’étend au-delà de toutes nos vies.`,
  },

  // --------------------------------------------------------------- VII
  {
    title: "Beug naa la",
    stage: "Le chant",
    mapNote: "Dans la langue de mon cœur.",
    riddle: "Quelle est la chanson qui me fait penser à toi ?",
    hint: "Je te l'ai déjà envoyée. Peut-être plus d'une fois.",
    answers: ["EXEMPLE-CHANSON"], // ⚠️ ex : ["dieuleul", "beug nala"]
    text: `Beug nala tei hawma louy beug
Naam nala tei minou mala
Miir lo ngama tei haw mala
Ma ham la ngamay dawlo

Ana kagn lalay Diap
Yaw sama perou beut
Yaw sama beutou hol
Beug naaaaaaaaaaaalaaaaaaaaaa

Ndaw sou minoul mbeugueil
khol ba dafay tiis
khol bou minoul mbeugueil
leer nga dafay miiss`,
  },

  // --------------------------------------------------------------- VIII
  {
    title: "Comme une rose",
    stage: "La rose",
    mapNote: "Veiller sur toi, délicatement.",
    riddle: "Quel cadeau t'ai-je offert en premier ?",
    hint: "Tu l'as peut-être encore près de toi.",
    answers: ["EXEMPLE-CADEAU"], // ⚠️ ex : ["un parfum", "parfum"]
    text: `Si je pouvais,
Je t’en donnerais chaque seconde,
Pour que chaque respiration te murmure :
« Le souvenir de ton parfum me suffit,
Comme l’eau pour ces roses.
Toute l’attention du monde, je te donnerais,
Comme on veille sur une rose,
Avec la tendresse de celui qui sait,
Avec la délicatesse de celui qui aime. »`,
  },

  // --------------------------------------------------------------- IX
  {
    title: "Ta courbure",
    stage: "Le manque",
    mapNote: "Quand tu n'es pas là.",
    riddle: "Quelle date je garde précieusement dans mon cœur ?",
    hint: "Jour et mois suffisent. Le jour où tout a commencé.",
    answers: ["EXEMPLE-DATE"], // ⚠️ ex : ["14 février", "14/02"]
    text: `Par le souvenir de ta courbure,
Par le rappel de ta gaieté,
Une douceur descend en moi,
Mon cœur se tranquillise,
Mon âme s’apaise,
Et le poids des jours
Consent enfin à devenir léger.

Est-il une chose sur cette terre plus douce que la femme ?
Est-elle supportable, cette vie, sans la quiétude qu’apporte la femme ?
Est-il secret mieux gardé que la matrice créatrice chez la femme ?
Elle est la matérialisation de l’imaginaire, la réalisation du possible.

L’homme, quant à lui, n’est que victime continue de sa misère.
Seuls sont épargnés ceux qui reconnaissent leur misère.
Et de ceux-là, seuls sont élevés à la grandeur humaine les amants.

Le bonheur n’habite pas l’aimé.
Le bonheur court derrière l’amant.
Celui-là qui aura donné de son sang pour sa bien-aimée.

Que ce jour où ma main contemplera à volonté ta courbure, plus que mes semblants de mots, arrive.
Que jamais ne cesse cette bénédiction que tu es pour moi, homme misérable.`,
  },

  // --------------------------------------------------------------- X
  {
    title: "Au crépuscule",
    stage: "L'éternité",
    mapNote: "Aimer jusqu'au dernier souffle.",
    riddle: "Que rêvé-je de faire avec toi, plus tard, quand nous serons vieux ?",
    hint: "Je te l'ai confié un soir, à voix basse.",
    answers: ["EXEMPLE-REVE"], // ⚠️ ex : ["voyager", "faire le pèlerinage"]
    text: `Au crépuscule de nos vies,
Quand le souffle faiblit au seuil de la mort,
Seuls ceux qui ont aimé n’emportent aucun regret.
Et le cœur, même éteint, conserve sa lueur d’or.

Aimer, c’est s’abandonner à l’oubli de soi,
Cesser d’exister pour mieux s’envoler.
Ô âme sans vie, ressuscite en trouvant ta foi.
Puisse ta flamme renaître, tendre et éveillée.

« Si ce n’était pour l’amour,
Aucun amant ne s’humilierait sur cette terre.
Mais, ô miracle, l’honneur des amants réside dans leur humilité. »

L’Amour, unique en sa forme,
Se révèle à travers mille visions.
Creuse, cherche cette essence intime,
Jusqu’à percer le secret de ses rumeurs.

Ressaisis-toi, toi l’âme perdue !
Comment dire l’indicible aux yeux muets ?
Il te suffit d’aimer pour que se lève la vue.
Ne laisse pas tes sens obscurcir tes souhaits.

Sois amant jusqu’à la réciproque étreinte,
Car l’Amour ne s’offre qu’à qui s’offre en retour.
Laisse ta raison aux portes qu’elle étreint.
Prie pour la folie qui fait éclore le jour.

As-tu jamais bu l’eau vive des éclats
Que l’Amour disperse en étincelles divines ?
Si tu te crois malchanceux, plonge là-bas
Et noie-toi jusqu’à danser dans ses rimes.

Dans ta quête, accueille ses perceptions,
Vivifie ton âme de ces subtiles lueurs ;
Car au terme de ta folle ascension,
Tu renaîtras en son infinie douceur.`,
  },

  // --------------------------------------------------------------- XI
  {
    title: "Le jardin secret",
    stage: "La dernière porte",
    mapNote: "Ce qui n'appartient qu'à nous.",
    riddle: "Dernière porte, la plus intime. Où t'embrasserai-je en premier, le jour de nos retrouvailles ?",
    hint: "Là où bat ce qui m'appartient déjà.",
    answers: ["EXEMPLE-REPONSE"], // ⚠️ ex : ["le front", "front"]
    text: `Il me tarde d’explorer toutes les parcelles de ton corps.
De visiter encore et encore les jardins que tu caches, ces paradis.
Je n’ai guère que d’imaginer, il me faut voir, sentir et toucher.
Mon âme réclame sa sœur.
Il suffit d’attendre, de patienter, alors que je pourrais te toucher des yeux, ensuite des mains et enfin de la langue.
Je veux plus que jamais pénétrer toute ton intimité.`,
  },
];
