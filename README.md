# amateur-alchemy

## TODO
- reset IP whitelist on mongodb atlas when deployed
- bring in beerAdvocate and untappd scores
- underlay style attributes on radar chart
- check if beer name/brewery combo already exists prior to writing review
- make background gradient animate
- make custom svg icons
- create profile image dropdown

## Important Notes:
The add-brewery pages uses a Google Maps API Place Autocomplete, which places a getPlaces() API call.  This incurs a billable charge after $200 / month (approx. 12,000 api calls per month).

## Deployment
Deployed via railway (https://railway.app/dashboard)
Used Cloudflare (https://dash.cloudflare.com/d400ebafeea9bc15e0602908dc6687aa/amateuralchemy.ca) nameservers in google domains since google domains doesn't accept railway's @ CNAMES by default (as per https://postulate.us/@samsonzhang/postulate/p/2022-08-17-Deploying-to-custom-Google-Domain-oqJpcTW46qVU7vD4KFdyVx)

## Inspo
#### Style
- https://www.hopculture.com/ 
- https://www.focusonthe.beer/
- https://www.goodbeerhunting.com/ 
- https://escarpmentlabs.com/blogs/
- http://thebeeroness.com/ 
- https://www.beervanablog.com/ 
#### Blog
- https://onbrewing.com/
- https://beerconnoisseur.com/
- https://boakandbailey.com/ 
- https://www.themadfermentationist.com/
- https://dataorigami.net/blogs/napkin-folding/bayesian-cell-counting
- https://dontdrinkbeer.com/ 
#### Reviews & Calculators
- https://beerandbrewing.com/review/ipa-avery/
- https://beermebc.com/reviews/container-brewing-ltd-frostbite-cold-ipa/