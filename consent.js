/* ══════════════════════════════════════════════════════════════════════
   MGE — Mesure d'audience et consentement
   ──────────────────────────────────────────────────────────────────────
   Un seul endroit à modifier : le bloc CONFIG ci-dessous.

   • fournisseur: null        → aucune mesure, aucune bannière. (état actuel)
   • fournisseur: 'plausible' → mesure sans cookie ni donnée personnelle.
                                Aucune bannière requise : la CNIL exempte
                                les solutions de mesure d'audience qui ne
                                déposent pas de traceur et n'identifient
                                personne. C'est l'option recommandée.
   • fournisseur: 'google'    → Google Analytics 4. Dépose des cookies et
                                transfère des données : la bannière devient
                                OBLIGATOIRE et le script n'est chargé
                                qu'après acceptation explicite.

   Après toute modification ici, mettre à jour la section « Cookies et
   stockage local » de confidentialite.html en conséquence.
   ══════════════════════════════════════════════════════════════════════ */

const CONFIG = {
    fournisseur: null,          // null | 'plausible' | 'google'
    domaine:     'mongegauthierenergie.github.io',   // pour Plausible
    idMesure:    ''             // 'G-XXXXXXXXXX' pour Google Analytics 4
};

const CLE_CONSENTEMENT = 'mge-consentement';

/* ── Stockage tolérant aux navigateurs qui le bloquent ── */
function lireChoix() {
    try { return localStorage.getItem(CLE_CONSENTEMENT); } catch { return null; }
}
function ecrireChoix(valeur) {
    try { localStorage.setItem(CLE_CONSENTEMENT, valeur); } catch { /* navigation privée */ }
}

/* ── Chargeurs ── */
function chargerPlausible() {
    const s = document.createElement('script');
    s.defer = true;
    s.dataset.domain = CONFIG.domaine;
    s.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(s);
}

function chargerGoogleAnalytics() {
    if (!CONFIG.idMesure) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.idMesure}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', CONFIG.idMesure, { anonymize_ip: true });
}

/* ── Bannière ── */
function construireBanniere() {
    const b = document.createElement('div');
    b.className = 'consent-bar';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Consentement à la mesure d’audience');
    b.innerHTML = `
        <p class="consent-txt">
            Nous souhaitons mesurer l'audience de ce site pour l'améliorer.
            Aucune donnée n'est utilisée à des fins publicitaires.
            <a href="confidentialite.html">En savoir plus</a>
        </p>
        <div class="consent-actions">
            <button type="button" class="consent-btn consent-btn--refus"  data-choix="refuse">Refuser</button>
            <button type="button" class="consent-btn consent-btn--accept" data-choix="accepte">Accepter</button>
        </div>`;
    b.addEventListener('click', e => {
        const btn = e.target.closest('[data-choix]');
        if (!btn) return;
        ecrireChoix(btn.dataset.choix);
        b.remove();
        if (btn.dataset.choix === 'accepte') chargerGoogleAnalytics();
    });
    document.body.appendChild(b);
}

/* ── Orchestration ── */
(function init() {
    if (!CONFIG.fournisseur) return;                  // rien à charger, rien à demander

    if (CONFIG.fournisseur === 'plausible') {         // sans cookie : exempté de consentement
        chargerPlausible();
        return;
    }

    if (CONFIG.fournisseur === 'google') {
        const choix = lireChoix();
        if (choix === 'accepte')      chargerGoogleAnalytics();
        else if (choix !== 'refuse')  construireBanniere();
    }
})();
