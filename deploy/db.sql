SET NAMES utf8;
DROP DATABASE IF EXISTS csv_import;
CREATE DATABASE csv_import;
USE csv_import;
DROP TABLE IF EXISTS csvdata;
CREATE TABLE `csvdata` (
    `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` int(10) UNSIGNED NOT NULL,
    `name` varchar(255) NOT NULL DEFAULT '',
    `age` int(10) UNSIGNED NOT NULL,
    `address` varchar(255) NOT NULL DEFAULT '',
    `team` varchar(255) NOT NULL DEFAULT '',
    `import_date` date NOT NULL,
    PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
