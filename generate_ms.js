const fs = require('fs');
const path = require('path');

const root = 'D:/grocery-store-management-system/backend-microservices';

const parentPom = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.1.2</version>
		<relativePath/>
	</parent>
	<groupId>com.mayank</groupId>
	<artifactId>grocery-microservices</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>pom</packaging>
	<name>grocery-microservices</name>

	<properties>
		<java.version>17</java.version>
		<spring-cloud.version>2022.0.4</spring-cloud.version>
	</properties>

	<modules>
		<module>discovery-server</module>
		<module>api-gateway</module>
		<module>product-service</module>
		<module>inventory-service</module>
		<module>supplier-service</module>
		<module>billing-service</module>
		<module>report-service</module>
	</modules>

	<dependencyManagement>
		<dependencies>
			<dependency>
				<groupId>org.springframework.cloud</groupId>
				<artifactId>spring-cloud-dependencies</artifactId>
				<version>\${spring-cloud.version}</version>
				<type>pom</type>
				<scope>import</scope>
			</dependency>
		</dependencies>
	</dependencyManagement>
</project>`;

const services = [
  {
    name: 'discovery-server',
    port: 8761,
    deps: `<dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
    </dependency>`,
    mainClass: `package com.mayank.discoveryserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class DiscoveryServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServerApplication.class, args);
    }
}`
  },
  {
    name: 'api-gateway',
    port: 8080,
    deps: `<dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-gateway</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>`,
    mainClass: `package com.mayank.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}`,
    applicationYml: "server:\n  port: 8080\nspring:\n  application:\n    name: api-gateway\n  cloud:\n    gateway:\n      globalcors:\n        corsConfigurations:\n          '[/**]':\n            allowedOrigins: \"*\"\n            allowedMethods:\n              - GET\n              - POST\n              - PUT\n              - DELETE\n              - OPTIONS\n            allowedHeaders: \"*\"\n      routes:\n        - id: product-service\n          uri: lb://product-service\n          predicates:\n            - Path=/api/products/**\n        - id: inventory-service\n          uri: lb://inventory-service\n          predicates:\n            - Path=/api/inventory/**\n        - id: supplier-service\n          uri: lb://supplier-service\n          predicates:\n            - Path=/api/suppliers/**\n        - id: billing-service\n          uri: lb://billing-service\n          predicates:\n            - Path=/api/billing/**\n        - id: report-service\n          uri: lb://report-service\n          predicates:\n            - Path=/api/reports/**\neureka:\n  client:\n    serviceUrl:\n      defaultZone: http://localhost:8761/eureka/"
  },
  {
    name: 'product-service',
    port: 8081,
    deps: `<dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
      <groupId>com.mysql</groupId>
      <artifactId>mysql-connector-j</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>`,
    mainClass: `package com.mayank.product;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ProductServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProductServiceApplication.class, args);
    }
}`
  },
  {
    name: 'inventory-service',
    port: 8082,
    deps: `<dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
      <groupId>com.mysql</groupId>
      <artifactId>mysql-connector-j</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>`,
    mainClass: `package com.mayank.inventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class InventoryServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(InventoryServiceApplication.class, args);
    }
}`
  },
  {
    name: 'supplier-service',
    port: 8083,
    deps: `<dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
      <groupId>com.mysql</groupId>
      <artifactId>mysql-connector-j</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>`,
    mainClass: `package com.mayank.supplier;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SupplierServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(SupplierServiceApplication.class, args);
    }
}`
  },
  {
    name: 'billing-service',
    port: 8084,
    deps: `<dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
      <groupId>com.mysql</groupId>
      <artifactId>mysql-connector-j</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>`,
    mainClass: `package com.mayank.billing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class BillingServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(BillingServiceApplication.class, args);
    }
}`
  },
  {
    name: 'report-service',
    port: 8085,
    deps: `<dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>`,
    mainClass: `package com.mayank.report;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ReportServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReportServiceApplication.class, args);
    }
}`
  }
];

fs.writeFileSync(path.join(root, 'pom.xml'), parentPom);

services.forEach(s => {
  const serviceDir = path.join(root, s.name);
  fs.mkdirSync(serviceDir, { recursive: true });

  const pom = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>com.mayank</groupId>
		<artifactId>grocery-microservices</artifactId>
		<version>0.0.1-SNAPSHOT</version>
	</parent>
	<artifactId>\${s.name}</artifactId>
	<name>\${s.name}</name>

	<dependencies>
		\${s.deps}
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>
</project>`;
  
  fs.writeFileSync(path.join(serviceDir, 'pom.xml'), pom.replace('\${s.name}', s.name).replace('\${s.name}', s.name).replace('\${s.deps}', s.deps));

  const pkgName = s.mainClass.match(/package (.*?);/)[1];
  const pkgDir = path.join(serviceDir, 'src/main/java', pkgName.replace(/\./g, '/'));
  fs.mkdirSync(pkgDir, { recursive: true });

  const mainClassName = s.mainClass.match(/public class ([a-zA-Z0-9_]+)/)[1];
  fs.writeFileSync(path.join(pkgDir, mainClassName + '.java'), s.mainClass);

  const resDir = path.join(serviceDir, 'src/main/resources');
  fs.mkdirSync(resDir, { recursive: true });

  let yml = s.applicationYml || "server:\n  port: " + s.port + "\nspring:\n  application:\n    name: " + s.name + "\n  datasource:\n    url: jdbc:mysql://localhost:3306/grocery_db?createDatabaseIfNotExist=true\n    username: root\n    password: \n  jpa:\n    hibernate:\n      ddl-auto: update\n    show-sql: true\neureka:\n  client:\n    serviceUrl:\n      defaultZone: http://localhost:8761/eureka/\n";

  if(s.name === 'discovery-server') {
    yml = "server:\n  port: 8761\neureka:\n  instance:\n    hostname: localhost\n  client:\n    registerWithEureka: false\n    fetchRegistry: false\n";
  }
  
  fs.writeFileSync(path.join(resDir, 'application.yml'), yml);
});

console.log("Microservices structure generated successfully.");
