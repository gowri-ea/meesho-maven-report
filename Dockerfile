FROM tomcat:9.0
COPY /usr/local/tomcat/webapps/ROOT.war
EXPOSE 8083
CMD ["catalina.sh","run"]
