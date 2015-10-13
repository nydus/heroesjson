#!/bin/bash
rsync -f "merge web.filter" --delete --delete-excluded -avL ../web/ sandbox:/srv/heroesjson.com/
scp ../nginx/heroesjson.com.conf sandbox:/srv/
