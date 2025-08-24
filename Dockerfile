FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine

RUN apk add gcompat

WORKDIR /app

COPY . /app

RUN dotnet publish -c Release -r linux-x64 --self-contained true /p:PublishSingleFile=true /p:PublishTrimmed=true /p:TrimMode=link -o ./

CMD ["./app"]