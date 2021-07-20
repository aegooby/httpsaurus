
FROM aegooby/httpsaurus:base-latest AS httpsaurus

# Dokku
EXPOSE 3080

WORKDIR /root/httpsaurus
ADD . /root/httpsaurus
RUN cli/install.sh
RUN turtle upgrade
RUN turtle cache

FROM httpsaurus AS localhost

RUN turtle clean --dist
RUN turtle docker:bundle --target localhost --domain localhost
CMD [ "turtle", "docker:server" ]

FROM httpsaurus AS dev

RUN turtle clean --dist
RUN turtle docker:bundle --target dev --domain dev.example.com
CMD [ "turtle", "docker:server" ]

FROM httpsaurus AS live

RUN turtle clean --dist
RUN turtle docker:bundle --target live --domain example.com
CMD [ "turtle", "docker:server" ]
