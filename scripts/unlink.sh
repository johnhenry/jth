shopt -s nullglob
for dir in ./packages/*/
do
  if [[ -d $dir ]]
  then
      cd $dir
      npm run unlink
      cd ../..
  fi
done
