# attentive-us/vegaserver
#
# VERSION           0.0.1

FROM node:11

WORKDIR /var/vegaserver

COPY *.js /var/vegaserver/
COPY *.json /var/vegaserver/

RUN npm install
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
EXPOSE 8888

CMD ["npm", "run", "start"]
