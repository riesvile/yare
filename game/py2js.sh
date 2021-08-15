ID=$1
PYIN="$ID.py"
WORKDIR="$ID-WORKDIR"
JSOUT="$WORKDIR/$ID.js"
echo "/*"
python -m transcrypt -b -m -n $PYIN -od $WORKDIR
echo "Transcrypt exited with $?*/"
npx esbuild $JSOUT --bundle --minify
rm -rf $WORKDIR
rm -f $PYIN