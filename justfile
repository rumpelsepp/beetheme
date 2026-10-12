# The recipes every site shares. A site takes them over with
#
#   import 'themes/bienensteff/justfile'
#
# at the top of its justfile and adds its own; a recipe it defines under
# the same name replaces the one here. What `just` alone does is the
# site's to say: it runs the first recipe of the site's justfile.

hugo := "./themes/bienensteff/scripts/hugo"

# Bundle CSS/JS from npm deps into assets/gen/ with esbuild
npm-build *args:
    npm run build -- {{ args }}

# --gc drops image variants nothing references any more from resources/_gen
# Build the site into public/
build: clean npm-build
    {{ hugo }} build --gc

# Run a local preview server, drafts included
serve: (npm-build "--sourcemap")
    {{ hugo }} server --buildDrafts

# Delete the built site in public/
clean:
    rm -rf public

# Update the Hugo container image
podman-pull:
    podman pull ghcr.io/gohugoio/hugo:latest

# Build and check the site for broken links and anchors
check-links: build
    lychee --offline --include-fragments public
