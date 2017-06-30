FROM node:8.1.2

WORKDIR /code

COPY package.json /code/package.json
RUN npm install

COPY bin /code/bin
COPY opt/resource /opt/resource
COPY src /code/src

EXPOSE 80

CMD ["bin/server"]
