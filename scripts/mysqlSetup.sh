#!/bin/bash
#############################################################
#                                                           #
#          Performing Commands are on the Bottom            #
#                                                           #
#############################################################

scriptName="MySQL Setup"

comments=()
commands=()

comments+=("Create tmp folder")
commands+=("mkdir tmp && cd tmp")

comments+=("Download Bundle")
commands+=('wget https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.16-2ubuntu18.04_amd64.deb-bundle.tar')

comments+=("Untar Download")
commands+=("tar -xvf mysql-server_8.0.16-2ubuntu18.04_amd64.deb-bundle.tar")

comments+=("Installing Libaio1")
commands+=("sudo apt-get install libaio1")

comments+=("Installing mysql-common")
commands+=("dpkg -i mysql-common_8.0.16-2ubuntu18.04_amd64.deb")

comments+=("Installing mysql-community-client")
commands+=("dpkg -i mysql-community-client_8.0.16-2ubuntu18.04_amd64.deb")

comments+=("Installing mysql-community-client-core")
commands+=("dpkg -i mysql-community-client-core_8.0.16-2ubuntu18.04_amd64.deb")

comments+=("Installing mysql-client")
commands+=("dpkg -i mysql-client_8.0.16-2ubuntu18.04_amd64.deb")

comments+=("Installing mysql-community-server-core")
commands+=("dpkg -i mysql-community-server-core_8.0.16-2ubuntu18.04_amd64.deb")

comments+=("Installing mysql-community-server")
commands+=("dpkg -i mysql-community-server_8.0.16-2ubuntu18.04_amd64.deb")

comments+=("Installing mysql-server")
commands+=("dpkg -i mysql-server_8.0.16-2ubuntu18.04_amd64.deb")

comments+=("Clean up tmp")
commands+=("cd .. & rm -rf ./tmp")


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
