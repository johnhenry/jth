shopt -s nullglob
for dir in ./packages/*/
do
  if [[ -d $dir ]]
  then
      cd $dir
      npm link
      cd ../..
  fi
done
# for dir in ./packages/*/
# do
#   if [[ -d $dir ]]
#   then
#       cd $dir
#       npm run link
#       cd ../..
#   fi
# done