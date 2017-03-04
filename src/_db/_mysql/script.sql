/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ ?? /*!40100 DEFAULT CHARACTER SET utf8 */;

USE ??;

/*Table structure for table `crawler_act` */

/*
DROP TABLE IF EXISTS `crawler_act`;

CREATE TABLE `crawler_act` (
  `crawler_id` varchar(10) NOT NULL,
  `act` int(10) unsigned NOT NULL,
  UNIQUE KEY `NewIndex1` (`crawler_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
*/


/*Table structure for table `hostlist` */

DROP TABLE IF EXISTS `hostlist`;

CREATE TABLE `hostlist` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `hostname` varchar(100) NOT NULL,
  `port` int(6) NOT NULL default '80',
  `status` int(11) NOT NULL default '0',
  `priority` int(11) unsigned NOT NULL default '0',
  PRIMARY KEY  (`hostname`),
  UNIQUE KEY `id` (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

/*Table structure for table `hostlist_extras` */

/*
DROP TABLE IF EXISTS `hostlist_extras`;

CREATE TABLE `hostlist_extras` (
  `host_id` int(10) unsigned NOT NULL,
  `max_pages` int(10) unsigned NOT NULL default '0',
  `max_level` int(10) NOT NULL default '-1',
  `max_seconds` int(10) unsigned NOT NULL default '0',
  `max_bytes` int(10) unsigned NOT NULL default '0',
  `max_HTTP_errors` int(10) unsigned NOT NULL default '0',
  `include_pages_regex` varchar(250) NOT NULL,
  `exclude_pages_regex` varchar(250) NOT NULL,
  PRIMARY KEY  (`host_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
*/

/*Table structure for table `pages_map` */

DROP TABLE IF EXISTS `pages_map`;

CREATE TABLE `pages_map` (
  `host_id` int(10) unsigned NOT NULL,
  `page` varchar(255) NOT NULL,
  `linkedhost_id` int(10) unsigned NOT NULL,
  `linkedpage` varchar(255) NOT NULL,
  `textlink` varchar(255) character set utf8 default NULL,
  UNIQUE KEY `unique_index` (`host_id`,`page`,`linkedhost_id`,`linkedpage`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;




CREATE DATABASE /*!32312 IF NOT EXISTS*/ ?? /*!40100 DEFAULT CHARACTER SET utf8 */;

USE ??;

/*Table structure for table `images` */

/*
DROP TABLE IF EXISTS `images`;

CREATE TABLE `images` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `src_host_id` int(10) unsigned NOT NULL,
  `src_page` varchar(255) NOT NULL,
  `image_host_id` int(10) unsigned NOT NULL,
  `image` varchar(255) NOT NULL,
  `alt_text` varchar(255) default NULL,
  `title_text` varchar(255) default NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `id` (`id`),
  FULLTEXT KEY `ft_alt_title` (`alt_text`,`title_text`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
*/

/*Table structure for table `mp3` */

/*
DROP TABLE IF EXISTS `mp3`;

CREATE TABLE `mp3` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `host_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `mp3_size` int(11) NOT NULL,
  `mp3_artist` varchar(250) NOT NULL,
  `mp3_title` varchar(250) NOT NULL,
  `mp3_album` varchar(250) NOT NULL,
  `mp3_genre` varchar(250) NOT NULL,
  `mp3_duration` int(11) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
*/

/*Table structure for table `pages` */

DROP TABLE IF EXISTS `pages`;

CREATE TABLE `pages` (
  `id` int(11) NOT NULL auto_increment,
  `host_id` int(10) unsigned NOT NULL,
  `hostname` varchar(100) NOT NULL,
  `page` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `anchor_text` varchar(255) NOT NULL,
  `text` longtext NOT NULL,
  `cache` longblob,
  `html_md5` varchar(32) NOT NULL,
  `level` int(11) unsigned NOT NULL default '0',
  `date` varchar(10) NOT NULL,
  `time` varchar(10) NOT NULL,
  PRIMARY KEY  (`id`),
  FULLTEXT KEY `NewIndex1` (`text`),
  FULLTEXT KEY `NewIndex2` (`hostname`),
  FULLTEXT KEY `NewIndex3` (`anchor_text`),
  FULLTEXT KEY `NewIndex4` (`title`),
  FULLTEXT KEY `NewIndex5` (`page`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

/*Table structure for table `pdf` */

/*
DROP TABLE IF EXISTS `pdf`;

CREATE TABLE `pdf` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `host_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `pdf_size` int(11) NOT NULL,
  `pdf_text` text NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
*/

/*Table structure for table `view_unique_pages` */

DROP TABLE IF EXISTS `view_unique_pages`;

/*!50001 DROP VIEW IF EXISTS `view_unique_pages` */;
/*!50001 DROP TABLE IF EXISTS `view_unique_pages` */;

/*!50001 CREATE TABLE `view_unique_pages` (
  `id` int(11) default NULL,
  `host_id` int(10) unsigned NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 */;

/*View structure for view view_unique_pages */

/*!50001 DROP TABLE IF EXISTS `view_unique_pages` */;
/*!50001 DROP VIEW IF EXISTS `view_unique_pages` */;

/*!50001 CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `view_unique_pages` AS (select min(`pages`.`id`) AS `id`,`pages`.`host_id` AS `host_id` from `pages` group by `pages`.`html_md5`) */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;

