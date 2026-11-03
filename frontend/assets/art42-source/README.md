# Reused TokenizeArt presentation assets

Source: https://github.com/hassankarrach/tokenizeart-nft-minting-dapp
Asset snapshot: commit 656aba861e669c3ba5c23a6c14cb5b1754fe0e35,
website/dist/assets/scene-base.png, characters/character-*-cutout.png and fonts/.
The source has no cutout for token 6; its existing full artwork is used instead.
Existing branded full previews remain in ../art42/.

The gallery adapts website/dist/collection.js and collection.css: selected artwork,
traits, search/rarity filters, horizontal browsing, character layers and stepped
card bases. The original catalog is in frontend/src/art42-catalog.json, copied
through the GitHub connector from website/dist/collection.json (main inspected
2026-11-03). Catalog traits are presentation data, not live tokenURI verification.

Gang of Three is by Vic Fieger. The original attribution is preserved in
fonts/README.md. The display face is applied across headings/navigation/buttons;
wallet addresses, input amounts and body text retain standard UI fonts.

No source scripts were executed or bundled directly. React interaction code is
adapted locally, and live chain state/transactions continue using BNB testnet.
