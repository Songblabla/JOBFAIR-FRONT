#!/bin/bash

# Directory to search for files
dir="/app/.next"

declare -A envVarsToReplace

tmpEnvVarFile="/app/.env"
function loadTmpEnv () {
    # Load the environment variables from the .env file
    envVars=$(egrep -v '^#' $tmpEnvVarFile)

    # loop over envVars and split them by '=', then set the key-value pair
    for envVar in $envVars
    do
        key=$(echo $envVar | cut -d'=' -f1)
        value=$(echo $envVar | cut -d'=' -f2)
        echo "Key: $key, Value: $value"

        envVarsToReplace[$key]=$value
    done
}

loadTmpEnv

# Loop over the keys of the associative array
for eName in "${!envVarsToReplace[@]}"
do
    # check if the env var is set
    if [[ -v $eName ]]; then
        echo "The environment variable $eName is set."

        # Find all files in the directory and replace occurrences of the string
        find $dir -type f -exec sed -i "s|${envVarsToReplace[$eName]}|$(printenv "$eName")|g" {} \;

        echo "Replacement completed."
    else
        echo "The environment variable $eName is not set."
    fi
done

exec "$@"