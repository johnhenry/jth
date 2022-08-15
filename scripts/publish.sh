shopt -s nullglob
for dir in ./packages/*/
do
  if [[ -d $dir ]]
  then
      cd $dir
      npm publish
      cd ../..
  fi
done
npm publish