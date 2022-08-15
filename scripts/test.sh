shopt -s nullglob
for dir in ./packages/*/
do
  if [[ -d $dir ]]
  then
      cd $dir
      npm test -s
      cd ../..
  fi
done