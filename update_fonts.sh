#!/bin/bash
FILES="src/app/dashboard/page.jsx src/components/organisms/*.jsx"
for file in $FILES; do
  # We do the replacement carefully to avoid overlapping matches
  sed -i -E 's/text-lg([^a-zA-Z-0-9])/text-xl\1/g' $file
  # Do not change text-xl if we just changed text-lg, so use order!
  
  # temporary replacements
  sed -i -E 's/text-sm([^a-zA-Z-0-9])/text_sm_tmp\1/g' $file
  sed -i -E 's/text-xs([^a-zA-Z-0-9])/text_xs_tmp\1/g' $file
  sed -i -E 's/text-\[10px\]/text_10px_tmp/g' $file
  sed -i -E 's/text-\[11px\]/text_11px_tmp/g' $file
  sed -i -E 's/text-\[9px\]/text_9px_tmp/g' $file
  sed -i -E 's/text-2xl([^a-zA-Z-0-9])/text_2xl_tmp\1/g' $file
  sed -i -E 's/text-3xl([^a-zA-Z-0-9])/text_3xl_tmp\1/g' $file

  # Now assign the new sizes
  sed -i 's/text_sm_tmp/text-base/g' $file
  sed -i 's/text_xs_tmp/text-sm/g' $file
  sed -i 's/text_10px_tmp/text-xs/g' $file
  sed -i 's/text_11px_tmp/text-sm/g' $file
  sed -i 's/text_9px_tmp/text-[10px]/g' $file
  sed -i 's/text_2xl_tmp/text-3xl/g' $file
  sed -i 's/text_3xl_tmp/text-4xl/g' $file

done
