shopt -s nullglob
for dir in ./packages/*/
do
  if [[ -d $dir ]]
  then
      cd $dir
      npm run publish
      cd ../..
  fi
done
npm publish