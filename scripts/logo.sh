shopt -s nullglob
for dir in ./packages/*/
do
  if [[ -d $dir ]]
  then
      cp "./logo.svg" "$dir/logo.svg"
  fi
done