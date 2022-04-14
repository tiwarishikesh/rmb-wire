-- phpMyAdmin SQL Dump
-- version 4.8.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 14, 2022 at 12:11 PM
-- Server version: 5.7.24
-- PHP Version: 7.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rmbinternational`
--

-- --------------------------------------------------------

--
-- Table structure for table `blogs`
--

DROP TABLE IF EXISTS `blogs`;
CREATE TABLE IF NOT EXISTS `blogs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(5) NOT NULL,
  `title` varchar(150) NOT NULL,
  `banner` varchar(500) NOT NULL,
  `thumbnail` varchar(500) NOT NULL,
  `blog_text` text NOT NULL,
  `posted_on` bigint(15) NOT NULL,
  `status` int(1) NOT NULL,
  `approved_on` bigint(15) NOT NULL,
  `approved_by` int(5) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `member`
--

DROP TABLE IF EXISTS `member`;
CREATE TABLE IF NOT EXISTS `member` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `prefix` varchar(250) DEFAULT NULL,
  `fname` varchar(250) NOT NULL,
  `lname` varchar(250) NOT NULL,
  `suffix` varchar(250) DEFAULT NULL,
  `membership_status` int(1) NOT NULL DEFAULT '0',
  `role` varchar(25) NOT NULL DEFAULT 'member',
  `club` varchar(400) NOT NULL,
  `about` varchar(2000) NOT NULL,
  `photo` varchar(500) DEFAULT NULL,
  `chapter` int(3) DEFAULT NULL,
  `approved_by` int(1) DEFAULT NULL,
  `registered_on` varchar(15) NOT NULL,
  `registration_date` date DEFAULT NULL,
  `gender` varchar(15) NOT NULL,
  `yearsinrotary` int(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `member`
--

INSERT INTO `member` (`id`, `prefix`, `fname`, `lname`, `suffix`, `membership_status`, `role`, `club`, `about`, `photo`, `chapter`, `approved_by`, `registered_on`, `registration_date`, `gender`, `yearsinrotary`) VALUES
(1, 'Mr', 'Rishikesh', 'Tiwari', ' ', 1, 'member', 'Rotaract Club of Dombivali SunCity', 'This is a small description of what I am about', 'photostorage.jpg', 1, 3, '98546325154', NULL, 'male', 6),
(2, 'Mr', 'RajaMohan', 'Dhandhapani', NULL, 1, 'member', 'Rotary', 'This is small description', NULL, NULL, NULL, '9821346831321', '2022-04-01', 'male', 10),
(3, NULL, 'Sachin', 'Gururaj', NULL, 1, 'member', 'Rotary', 'This is the about section', NULL, NULL, NULL, '12345678890', NULL, 'male', 10);

-- --------------------------------------------------------

--
-- Table structure for table `membership_information`
--

DROP TABLE IF EXISTS `membership_information`;
CREATE TABLE IF NOT EXISTS `membership_information` (
  `member_id` int(10) NOT NULL,
  `membership_plan` int(10) NOT NULL,
  `start_date` bigint(15) NOT NULL,
  `end_date` bigint(15) NOT NULL,
  PRIMARY KEY (`member_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `membership_plans`
--

DROP TABLE IF EXISTS `membership_plans`;
CREATE TABLE IF NOT EXISTS `membership_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `active` int(1) NOT NULL,
  `plan_name` varchar(250) NOT NULL,
  `price` decimal(6,2) NOT NULL,
  `duration_in_days` int(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `member_authentication`
--

DROP TABLE IF EXISTS `member_authentication`;
CREATE TABLE IF NOT EXISTS `member_authentication` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `password` varchar(256) NOT NULL,
  `set_on` bigint(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `member_authentication`
--

INSERT INTO `member_authentication` (`id`, `member_id`, `password`, `set_on`) VALUES
(1, 1, '$2y$10$9a52KWa9ZGq0TyLtauhBOuTbnP1pdoWxkNILpx0rS7hCaFppX8Yvy', 1649916515),
(2, 2, '$2y$10$9a52KWa9ZGq0TyLtauhBOuTbnP1pdoWxkNILpx0rS7hCaFppX8Yvy', 12),
(3, 3, '$2y$10$9a52KWa9ZGq0TyLtauhBOuTbnP1pdoWxkNILpx0rS7hCaFppX8Yvy', 123464);

-- --------------------------------------------------------

--
-- Table structure for table `member_connections`
--

DROP TABLE IF EXISTS `member_connections`;
CREATE TABLE IF NOT EXISTS `member_connections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requested_by` int(11) NOT NULL,
  `requested_to` int(11) NOT NULL,
  `sent_on` varchar(15) NOT NULL,
  `status` int(1) NOT NULL,
  `approved_on` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `member_contact`
--

DROP TABLE IF EXISTS `member_contact`;
CREATE TABLE IF NOT EXISTS `member_contact` (
  `member_id` int(11) NOT NULL,
  `contact_type` varchar(100) NOT NULL,
  `details` varchar(100) NOT NULL,
  UNIQUE KEY `details` (`details`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `member_contact`
--

INSERT INTO `member_contact` (`member_id`, `contact_type`, `details`) VALUES
(1, 'email', 'rishi@kanris.biz'),
(2, 'email', 'rajamohan@gmail.com'),
(3, 'email', 'sachingururaj@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `member_events`
--

DROP TABLE IF EXISTS `member_events`;
CREATE TABLE IF NOT EXISTS `member_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_title` varchar(500) NOT NULL,
  `event_type` varchar(200) DEFAULT NULL,
  `event_datetime` bigint(15) NOT NULL,
  `details` json NOT NULL,
  `member_id` int(11) NOT NULL,
  `status` int(1) NOT NULL,
  `approved_by` int(5) NOT NULL,
  `approved_on` bigint(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `member_event_photos`
--

DROP TABLE IF EXISTS `member_event_photos`;
CREATE TABLE IF NOT EXISTS `member_event_photos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(5) NOT NULL,
  `member_id` int(11) NOT NULL,
  `photo` varchar(500) NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` varchar(2000) NOT NULL,
  `posted_on` bigint(15) NOT NULL,
  `approved_by` int(11) NOT NULL,
  `approved_on` bigint(15) NOT NULL,
  `status` int(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `member_gallery`
--

DROP TABLE IF EXISTS `member_gallery`;
CREATE TABLE IF NOT EXISTS `member_gallery` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `name` varchar(500) NOT NULL,
  `description` varchar(5000) NOT NULL,
  `status` int(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `member_gallery_photo`
--

DROP TABLE IF EXISTS `member_gallery_photo`;
CREATE TABLE IF NOT EXISTS `member_gallery_photo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gallery_id` int(7) NOT NULL,
  `photo_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `member_groups`
--

DROP TABLE IF EXISTS `member_groups`;
CREATE TABLE IF NOT EXISTS `member_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(1000) NOT NULL,
  `description` varchar(5000) NOT NULL,
  `status` int(1) NOT NULL,
  `started_by` int(11) NOT NULL,
  `approved_by` int(11) NOT NULL,
  `approved_on` bigint(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `member_group_participants`
--

DROP TABLE IF EXISTS `member_group_participants`;
CREATE TABLE IF NOT EXISTS `member_group_participants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `status` int(1) NOT NULL,
  `approved_on` bigint(15) NOT NULL,
  `approved_by` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `member_group_photos`
--

DROP TABLE IF EXISTS `member_group_photos`;
CREATE TABLE IF NOT EXISTS `member_group_photos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `photo` varchar(500) NOT NULL,
  `title` varchar(1000) NOT NULL,
  `description` varchar(5000) NOT NULL,
  `status` int(1) NOT NULL DEFAULT '0',
  `uploaded_by` int(11) NOT NULL,
  `approved_by` int(11) NOT NULL,
  `approved_on` bigint(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `member_otp`
--

DROP TABLE IF EXISTS `member_otp`;
CREATE TABLE IF NOT EXISTS `member_otp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `otp_type` varchar(100) NOT NULL,
  `otp` varchar(250) NOT NULL,
  `set_on` bigint(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `member_otp`
--

INSERT INTO `member_otp` (`id`, `member_id`, `otp_type`, `otp`, `set_on`) VALUES
(1, 1, 'magicLink', '$2y$10$g.pP6OYEeMpiNsMdYQVky.l6ktT.clOUBVOyfbgPMpgBOBocigLYm', 1649917333),
(2, 1, 'magicLink', '$2y$10$Ug0dBftp23urN9H/piw7ZekAhBVjUvfsdnse03QH2gQrn2nmDGMHW', 1649917840),
(3, 1, 'magicLink', '$2y$10$NsGhQ4uqvMXD9RqfmVRzV.1L656lmZOS4/YtqM0lpJOo1Ky4ktB4.', 1649918380),
(4, 1, 'magicLink', '$2y$10$0syv4eyCL2sClXJpep8I9.AIf2m69hl1277kYB1glJ.jNjDhqdQDK', 1649918412),
(5, 1, 'magicLink', '$2y$10$EBylR8g6.BXN5DJK6J08keGJorAPmZAfrqotVDTa7fFxrCoc3Cl5q', 1649918429),
(6, 1, 'magicLink', '$2y$10$0AAcdlDa1OOUAJqSE6KN9ujVXolhZyh8MRKYwAnUZUZ6/qImGLKp.', 1649918528),
(7, 1, 'magicLink', '$2y$10$7ckiykyF3y6cFhAWjVRNF.kAWizmtTO66VCMKmfnZ3END6Rns1YLS', 1649918799),
(8, 1, 'magicLink', '$2y$10$sePf3TBiqPxLU.r1NHfid.DQ34eIztCQQDWWK0ups1H5j0gw7.hGa', 1649918914),
(9, 1, 'magicLink', '$2y$10$8Hgb2SRAZyTvYysJpmknKOxzZTvG.0/7nfrMp.jAYG.Uqueq3Rwru', 1649919021),
(10, 1, 'magicLink', '$2y$10$U16F4W6jkK1K2oZVIYBpEe8Hzyh8b.QY5NIGJZA4IB2yPhwhoGShi', 1649919120),
(11, 1, 'magicLink', '$2y$10$sgC/wvBzsfClkMAn36ZKV.CwszpmLR4qvObo.3HGzAsP0FGzDXwhq', 1649919183),
(12, 1, 'magicLink', '$2y$10$dvU1zY2HlS3q6gBWqEHw0.xsH1rS0kDrN0tFymaKsdi5iza4QwnIe', 1649920619),
(13, 1, 'magicLink', '$2y$10$n841CL6h6gOe0JGDboDwMeznuE5ejX24bzntefhVhtmYAvr.jMoM.', 1649921619),
(14, 1, 'magicLink', '$2y$10$CUTPST0D12whnsf8FT7S4u7klVqOJ2CLLTOh4tq0H9SfreuovTGAi', 1649921725);

-- --------------------------------------------------------

--
-- Table structure for table `member_photos`
--

DROP TABLE IF EXISTS `member_photos`;
CREATE TABLE IF NOT EXISTS `member_photos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `photo_name` varchar(450) NOT NULL,
  `photo_title` varchar(450) NOT NULL,
  `photo_description` varchar(450) NOT NULL,
  `status` int(1) NOT NULL DEFAULT '0',
  `approved_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `member_posts`
--

DROP TABLE IF EXISTS `member_posts`;
CREATE TABLE IF NOT EXISTS `member_posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `post_body` varchar(3000) NOT NULL,
  `image` varchar(2000) NOT NULL,
  `status` int(1) NOT NULL DEFAULT '0',
  `posted_on` bigint(15) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_on` bigint(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `member_post_comments`
--

DROP TABLE IF EXISTS `member_post_comments`;
CREATE TABLE IF NOT EXISTS `member_post_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `comment_text` varchar(2000) DEFAULT NULL,
  `status` int(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `member_post_reactions`
--

DROP TABLE IF EXISTS `member_post_reactions`;
CREATE TABLE IF NOT EXISTS `member_post_reactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) NOT NULL,
  `reaction_type` int(1) NOT NULL,
  `member_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `member_profession`
--

DROP TABLE IF EXISTS `member_profession`;
CREATE TABLE IF NOT EXISTS `member_profession` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organisation_name` varchar(1000) NOT NULL,
  `position` varchar(500) NOT NULL,
  `description` varchar(3000) NOT NULL,
  `classification` int(4) NOT NULL,
  `member_id` int(11) NOT NULL,
  `organisation_address` varchar(1000) NOT NULL,
  `organisation_photo` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `member_profession`
--

INSERT INTO `member_profession` (`id`, `organisation_name`, `position`, `description`, `classification`, `member_id`, `organisation_address`, `organisation_photo`) VALUES
(1, 'KANRIS Infotech Pvt Ltd', 'CEO', 'This is an IT sector organisation', 1, 1, 'RM29, Sudama Naga', 'null');

-- --------------------------------------------------------

--
-- Table structure for table `member_receipts`
--

DROP TABLE IF EXISTS `member_receipts`;
CREATE TABLE IF NOT EXISTS `member_receipts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `total_payable` decimal(8,2) NOT NULL,
  `payment_method` int(1) NOT NULL,
  `payment_gateway_order_id` varchar(500) NOT NULL,
  `payment_status` int(1) NOT NULL,
  `generated_on` bigint(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `member_receipt_items`
--

DROP TABLE IF EXISTS `member_receipt_items`;
CREATE TABLE IF NOT EXISTS `member_receipt_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `receipt_id` bigint(11) NOT NULL,
  `item_type` int(1) NOT NULL,
  `item_id` int(5) NOT NULL,
  `item_count` int(4) NOT NULL,
  `unit_price` decimal(8,2) NOT NULL,
  `total_payable` decimal(8,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `rmb_chapter`
--

DROP TABLE IF EXISTS `rmb_chapter`;
CREATE TABLE IF NOT EXISTS `rmb_chapter` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chapter_name` varchar(500) NOT NULL,
  `description` varchar(2000) NOT NULL,
  `member_id` int(5) NOT NULL,
  `approved_on` bigint(15) NOT NULL,
  `approved_by` int(11) NOT NULL,
  `charter_club` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `shop_items`
--

DROP TABLE IF EXISTS `shop_items`;
CREATE TABLE IF NOT EXISTS `shop_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL,
  `description` varchar(5000) NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `discounted_price` decimal(8,2) NOT NULL,
  `status` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `shop_item_photos`
--

DROP TABLE IF EXISTS `shop_item_photos`;
CREATE TABLE IF NOT EXISTS `shop_item_photos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(5) NOT NULL,
  `photo` varchar(500) NOT NULL,
  `name` varchar(500) NOT NULL,
  `description` varchar(2000) NOT NULL,
  `status` int(1) NOT NULL DEFAULT '1',
  `is_primary` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `website_about`
--

DROP TABLE IF EXISTS `website_about`;
CREATE TABLE IF NOT EXISTS `website_about` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `text` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `website_about`
--

INSERT INTO `website_about` (`id`, `title`, `text`) VALUES
(1, 'legend', 'NA'),
(2, 'purpose', 'NA'),
(3, 'bylaws', 'NA'),
(4, 'guidelines', 'NA\r\n');

-- --------------------------------------------------------

--
-- Table structure for table `website_advertisements`
--

DROP TABLE IF EXISTS `website_advertisements`;
CREATE TABLE IF NOT EXISTS `website_advertisements` (
  `id` int(11) NOT NULL,
  `type` int(1) NOT NULL,
  `image` varchar(500) NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` varchar(2000) NOT NULL,
  `status` int(1) NOT NULL,
  `uploaded_on` bigint(15) NOT NULL,
  `uploaded_by` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `website_board`
--

DROP TABLE IF EXISTS `website_board`;
CREATE TABLE IF NOT EXISTS `website_board` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `position` varchar(250) NOT NULL,
  `status` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `website_enquires`
--

DROP TABLE IF EXISTS `website_enquires`;
CREATE TABLE IF NOT EXISTS `website_enquires` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(1000) NOT NULL,
  `email` varchar(1000) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `message` varchar(2000) NOT NULL,
  `origin` varchar(2000) NOT NULL,
  `recieved_on` bigint(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `website_faqs`
--

DROP TABLE IF EXISTS `website_faqs`;
CREATE TABLE IF NOT EXISTS `website_faqs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question` varchar(2000) NOT NULL,
  `answer` varchar(3000) NOT NULL,
  `status` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `website_meetings`
--

DROP TABLE IF EXISTS `website_meetings`;
CREATE TABLE IF NOT EXISTS `website_meetings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `meeting_date` bigint(15) NOT NULL,
  `meeting_date_in_datetime` date DEFAULT NULL,
  `meting_type` int(1) NOT NULL,
  `name` varchar(500) NOT NULL,
  `description` varchar(2000) NOT NULL,
  `minutes_pdf` varchar(500) NOT NULL,
  `member_id` int(11) NOT NULL,
  `uploaded_on` bigint(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `website_photos`
--

DROP TABLE IF EXISTS `website_photos`;
CREATE TABLE IF NOT EXISTS `website_photos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` int(2) NOT NULL,
  `photo` varchar(500) NOT NULL,
  `title` varchar(200) NOT NULL,
  `status` int(1) NOT NULL,
  `uploaded_on` bigint(15) NOT NULL,
  `uploaded_by` int(5) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `website_statistics`
--

DROP TABLE IF EXISTS `website_statistics`;
CREATE TABLE IF NOT EXISTS `website_statistics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `number` varchar(10) NOT NULL,
  `status` int(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `website_subscriber`
--

DROP TABLE IF EXISTS `website_subscriber`;
CREATE TABLE IF NOT EXISTS `website_subscriber` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `emailID` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `website_testimonials`
--

DROP TABLE IF EXISTS `website_testimonials`;
CREATE TABLE IF NOT EXISTS `website_testimonials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(5) NOT NULL,
  `testimonial_text` varchar(500) NOT NULL,
  `status` int(1) NOT NULL,
  `uploaded_on` int(15) NOT NULL,
  `uploaded_by` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
