
MANABI_DIR=~/src/manabi

alias g="git"
alias cdm="cd $MANABI_DIR/manabi"
alias mm="python $MANABI_DIR/manage.py"
alias mshell="mm shell_plus"
alias mt="DJANGO_SETTINGS_MODULE=manabi.settings_testing mm test"
#alias mkill="cat $MANABI_DIR/run/redis.pid "
alias mrun="cdm && cd .. && redis-server redis.2.2.conf ; cdm && mm runserver 4649"

alias cdsp="cd ~VIRTUAL_ENV/lib/python2.7/site-packages"

