#!/bin/bash
#############################################################
#                                                           #
#          Performing Commands are on the Bottom            #
#                                                           #
#############################################################

scriptName="Redis Setup"

comments=()
commands=()

comments+=("Create tmp folder")
commands+=("mkdir -p tmp && cd tmp")

comments+=("Download Redis")
commands+=('wget http://download.redis.io/redis-stable.tar.gz')

comments+=("Untar redis")
commands+=('tar xzvf redis-stable.tar.gz')

comments+=("Move into folder")
commands+=('cd redis-stable')

comments+=("Compile redis")
commands+=('make')

comments+=("Install binaries onto the system")
commands+=('sudo make install')

comments+=("Move back")
commands+=('cd ..')

comments+=("Move back")
commands+=('cd ..')

comments+=("Clean up tmp")
commands+=("rm -rf ./tmp")


#############################################################
#                    Arguments parsing                      #
#############################################################

POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -ps|--percentagestart)
    PERCENTAGESTART="$2"
    shift # past argument
    shift # past value
    ;;
    -pe|--percentageend)
    PERCENTAGEEND="$2"
    shift # past argument
    shift # past value
    ;;
    -v|--verbose)
    VERBOSE="-v"
    shift # past argument
    ;;
    -h|--help)
    HELP=YES
    shift # past argument
    ;;
    *)    # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

if [[ -n $1 ]]; then
    echo "Unkown Argument: ${1}"
    echo "Use -h for Help"
    exit
fi

if [[ $HELP = YES ]]; then
    echo "Possible Parameters:"
    echo "-ps <1...100>      (Percentage Start: Default 1)"
    echo "-pe <1...100>      (Percentage End: Default 100)"
    echo "-v                 (Verbose: Shows output log)"
    echo "-h                 (Help: Shows this output)"
    exit
fi

PERCENTAGESTARTVARIABLE=${PERCENTAGESTART:-1}
PERCENTAGEENDVARIABLE=${PERCENTAGEEND:-100}
VERBOSEVARIABE=${VERBOSE:-" "}


#############################################################
#                    Progress Bar                           #
#############################################################
prog() {
    local w=80 percentagegiven=$1;  shift
    p=$((percentagegiven*(PERCENTAGEENDVARIABLE-PERCENTAGESTARTVARIABLE)/100+PERCENTAGESTARTVARIABLE))
    # print those dots on a fixed-width space plus the percentage etc.
    printf "\r\033[K| \e[32m%3d %%\e[0m | %s" "$(tput cols)" "" "$p" "$*";
}


#############################################################
#                  Verbose Mode Set                         #
#############################################################

VERBOSEMODE="&>/dev/null"
if [[ $VERBOSEVARIABE = "-v" ]]
then
    VERBOSEMODE=""
fi

run(){
	eval "$* ${VERBOSEMODE}"
}


#############################################################
#                                                           #
#                 Performing Commands                       #
#                                                           #
#############################################################

prog 1 ${scriptName}: Setup Start

commandsSize=${#commands[@]}
progressPercent=1

for i in "${!comments[@]}"; do
  prog ${progressPercent} ${scriptName}: ${comments[$i]}
  run ${commands[$i]}
  progressPercent=$((100*(i+1)/commandsSize))
done

prog 100 ${scriptName}: Setup Complete
echo ""
