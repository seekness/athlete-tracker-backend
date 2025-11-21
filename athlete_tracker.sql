-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 21, 2025 at 02:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `athlete_tracker`
--

-- --------------------------------------------------------

--
-- Table structure for table `athletes`
--

CREATE TABLE `athletes` (
  `id` int(11) NOT NULL,
  `ime` varchar(255) NOT NULL,
  `prezime` varchar(255) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `datum_rodenja` date DEFAULT NULL,
  `broj_telefona` varchar(20) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `ime_roditelja` varchar(255) DEFAULT NULL,
  `jmbg` varchar(13) DEFAULT NULL,
  `mesto_rodenja` varchar(255) DEFAULT NULL,
  `adresa_stanovanja` varchar(255) DEFAULT NULL,
  `mesto_stanovanja` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `aktivan` tinyint(1) DEFAULT 1,
  `broj_knjizice` varchar(255) DEFAULT NULL,
  `datum_poslednjeg_sportskog_pregleda` date DEFAULT NULL,
  `is_paying_member` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Da li sportista placa clanarinu',
  `payment_start_date` date DEFAULT NULL COMMENT 'Datum od kada pocinje da placa clanarinu',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Vreme kreiranja sloga'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `athletes`
--

INSERT INTO `athletes` (`id`, `ime`, `prezime`, `username`, `datum_rodenja`, `broj_telefona`, `user_id`, `ime_roditelja`, `jmbg`, `mesto_rodenja`, `adresa_stanovanja`, `mesto_stanovanja`, `email`, `aktivan`, `broj_knjizice`, `datum_poslednjeg_sportskog_pregleda`, `is_paying_member`, `payment_start_date`, `created_at`) VALUES
(1, 'Zoran', 'Kosanović', 'seekness', '1982-11-02', '063468056', 1, 'Marija', '1111982110017', NULL, '', '', '', 1, '', '1899-11-26', 1, '2025-01-01', '2025-08-24 20:03:07'),
(2, 'Zoran', 'Kosanović', 'miner', '2007-10-27', '063468056', 2, 'Mile', '1111982110017', NULL, 'Banatska 2v', 'Sombor', 'seekness@gmail.com', 1, 'aaaa', '2025-05-01', 0, '2024-12-27', '2025-08-24 20:03:07'),
(3, 'Antonija', 'Mala', 'amala', '2013-05-13', '00192290201', 3, 'Perica', '1212121212111', NULL, 'Banatska 2v', 'Sombor', 'nesto@hhaa.zu', 1, '', '2025-08-08', 1, '2024-12-29', '2025-08-24 20:03:07'),
(4, 'Ognjen', 'Kosanović', 'ogilic', '2016-07-21', '', NULL, 'Zoran', '2507016111000', NULL, 'Banatska 2v', 'Sombor', '', 1, '', '1899-11-26', 1, '2024-12-31', '2025-08-24 20:03:07'),
(5, 'Test', 'Dodavanje', 'testd', '2010-04-06', '', NULL, '', '', NULL, '', '', '', 1, '', NULL, 1, '2025-08-31', '2025-09-25 21:28:18');

-- --------------------------------------------------------

--
-- Table structure for table `coach_athlete_assignments`
--

CREATE TABLE `coach_athlete_assignments` (
  `id` int(11) NOT NULL,
  `coach_id` int(11) NOT NULL,
  `athlete_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `coach_athlete_assignments`
--

INSERT INTO `coach_athlete_assignments` (`id`, `coach_id`, `athlete_id`, `assigned_at`) VALUES
(1, 4, 2, '2025-08-12 15:11:27'),
(2, 4, 3, '2025-08-12 15:14:30'),
(14, 6, 4, '2025-09-06 10:11:26'),
(15, 6, 3, '2025-09-06 10:11:34'),
(16, 6, 5, '2025-09-25 21:29:09');

-- --------------------------------------------------------

--
-- Table structure for table `coach_group_assignments`
--

CREATE TABLE `coach_group_assignments` (
  `id` int(11) NOT NULL,
  `coach_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `coach_group_assignments`
--

INSERT INTO `coach_group_assignments` (`id`, `coach_id`, `group_id`, `assigned_at`) VALUES
(1, 4, 1, '2025-08-12 15:11:27'),
(2, 4, 2, '2025-08-23 14:10:35'),
(6, 6, 1, '2025-09-06 09:27:19'),
(7, 4, 4, '2025-09-06 10:45:17');

-- --------------------------------------------------------

--
-- Table structure for table `exercises`
--

CREATE TABLE `exercises` (
  `id` int(11) NOT NULL,
  `naziv` varchar(255) NOT NULL,
  `opis` text DEFAULT NULL,
  `muscle_group_id` int(11) DEFAULT NULL,
  `oprema` varchar(255) DEFAULT NULL,
  `unilateral` tinyint(1) DEFAULT 0,
  `video_link` varchar(255) DEFAULT NULL,
  `slika` varchar(255) DEFAULT NULL,
  `exercise_category_id` int(11) DEFAULT NULL,
  `other_muscle_group_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `exercises`
--

INSERT INTO `exercises` (`id`, `naziv`, `opis`, `muscle_group_id`, `oprema`, `unilateral`, `video_link`, `slika`, `exercise_category_id`, `other_muscle_group_id`) VALUES
(2, 'Bench press', '', 1, 'Tegovi', 0, '', '/uploads/exercises/2.gif', 2, 5),
(3, 'Cable lat pull', '', 2, 'Lat mašina', 0, '', '/uploads/exercises/3.gif', 2, 4),
(5, 'Zagrevanje', '', 2, 'čamac, veslo', 0, '', '', 1, 11),
(6, 'Veslanje', '', 2, 'čamac, veslo', 0, '', '', 1, 11),
(7, 'Veslanje sa gumom', '', 2, 'čamac, veslo, guma', 0, '', '', 1, 11);

-- --------------------------------------------------------

--
-- Table structure for table `exercise_categories`
--

CREATE TABLE `exercise_categories` (
  `id` int(11) NOT NULL,
  `naziv` varchar(255) NOT NULL,
  `opis` text DEFAULT NULL,
  `ikonica` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `exercise_categories`
--

INSERT INTO `exercise_categories` (`id`, `naziv`, `opis`, `ikonica`) VALUES
(1, 'Veslanje', 'Veslanje na otovrenom', NULL),
(2, 'Teretana', 'Rad na snazi', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `fizicke_mere`
--

CREATE TABLE `fizicke_mere` (
  `id` int(11) NOT NULL,
  `athlete_id` int(11) NOT NULL,
  `datum_merenja` date NOT NULL,
  `visina_cm` decimal(5,2) DEFAULT NULL,
  `tezina_kg` decimal(5,2) DEFAULT NULL,
  `obim_struka_cm` decimal(5,2) DEFAULT NULL,
  `obim_kukova_cm` decimal(5,2) DEFAULT NULL,
  `obim_grudi_cm` decimal(5,2) DEFAULT NULL,
  `obim_nadlaktice_cm` decimal(5,2) DEFAULT NULL,
  `obim_podlaktice_cm` decimal(5,2) DEFAULT NULL,
  `obim_ramena_cm` decimal(5,2) DEFAULT NULL,
  `obim_butine_cm` decimal(5,2) DEFAULT NULL,
  `obim_vrata_cm` decimal(5,2) DEFAULT NULL,
  `bmi` decimal(5,2) GENERATED ALWAYS AS (`tezina_kg` / pow(`visina_cm` / 100,2)) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `fizicke_mere`
--

INSERT INTO `fizicke_mere` (`id`, `athlete_id`, `datum_merenja`, `visina_cm`, `tezina_kg`, `obim_struka_cm`, `obim_kukova_cm`, `obim_grudi_cm`, `obim_nadlaktice_cm`, `obim_podlaktice_cm`, `obim_ramena_cm`, `obim_butine_cm`, `obim_vrata_cm`) VALUES
(1, 2, '2025-08-30', 182.00, 94.00, 95.00, NULL, NULL, 34.00, NULL, NULL, NULL, NULL),
(3, 3, '2025-08-30', 124.00, 25.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 2, '2025-08-20', 182.00, 93.00, NULL, NULL, NULL, NULL, NULL, 115.00, NULL, NULL),
(5, 2, '2025-08-31', 182.00, 94.50, NULL, 105.00, NULL, NULL, NULL, NULL, 61.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE `groups` (
  `id` int(11) NOT NULL,
  `naziv` varchar(255) NOT NULL,
  `opis` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `groups`
--

INSERT INTO `groups` (`id`, `naziv`, `opis`) VALUES
(1, 'Napredna', 'Stariji i bolji klinci'),
(2, 'Početna', 'Početnici i slabiji takmičari'),
(4, 'Test grupa', 'test grupa sa dodelom');

-- --------------------------------------------------------

--
-- Table structure for table `group_memberships`
--

CREATE TABLE `group_memberships` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `athlete_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `group_memberships`
--

INSERT INTO `group_memberships` (`id`, `group_id`, `athlete_id`) VALUES
(37, 1, 1),
(35, 1, 2),
(40, 1, 3),
(41, 2, 3),
(42, 2, 4),
(43, 2, 5);

-- --------------------------------------------------------

--
-- Table structure for table `individuals`
--

CREATE TABLE `individuals` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ime` varchar(50) NOT NULL,
  `prezime` varchar(50) NOT NULL,
  `datum_rodjenja` date DEFAULT NULL,
  `pol` enum('musko','zensko','drugo') DEFAULT NULL,
  `cilj` text DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` int(11) NOT NULL,
  `naziv` varchar(255) NOT NULL,
  `adresa` varchar(255) DEFAULT NULL,
  `mesto` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `naziv`, `adresa`, `mesto`) VALUES
(1, 'Kajak klub', 'Apatinski put bb', 'Sombor'),
(2, 'Kajak klub - teretana', 'Apatinski put bb', 'Sombor'),
(3, 'Mostonga - teretana', 'Apatinski put bb', 'Sombor'),
(5, 'Mostonga - trim staza', 'Apatinski put bb', 'Sombor');

-- --------------------------------------------------------

--
-- Table structure for table `membership_fees`
--

CREATE TABLE `membership_fees` (
  `id` int(11) NOT NULL,
  `amount_first` decimal(10,2) NOT NULL COMMENT 'Iznos za prvo dete',
  `amount_second` decimal(10,2) NOT NULL COMMENT 'Iznos za drugo dete',
  `amount_third` decimal(10,2) NOT NULL COMMENT 'Iznos za trece dete',
  `valid_from` date NOT NULL COMMENT 'Datum od kada cena vazi'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `membership_fees`
--

INSERT INTO `membership_fees` (`id`, `amount_first`, `amount_second`, `amount_third`, `valid_from`) VALUES
(1, 2500.00, 1500.00, 800.00, '2024-12-31');

-- --------------------------------------------------------

--
-- Table structure for table `membership_payments`
--

CREATE TABLE `membership_payments` (
  `id` int(11) NOT NULL,
  `athlete_id` int(11) NOT NULL,
  `payment_date` date NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `child_order` int(11) NOT NULL COMMENT 'Redni broj deteta (1, 2, 3)',
  `note` text DEFAULT NULL,
  `payment_month` date NOT NULL COMMENT 'Mjesec za koji je placena clanarina'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `membership_payments`
--

INSERT INTO `membership_payments` (`id`, `athlete_id`, `payment_date`, `amount_paid`, `child_order`, `note`, `payment_month`) VALUES
(1, 3, '2025-08-24', 2500.00, 1, '', '2025-01-01'),
(2, 3, '2025-08-27', 800.00, 3, '', '2025-02-01'),
(10, 3, '2025-08-27', 2500.00, 1, '', '2025-03-01'),
(11, 3, '2025-08-27', 2500.00, 1, '', '2025-04-01'),
(13, 1, '2025-09-08', 2500.00, 1, '', '2025-05-01'),
(14, 1, '2025-09-08', 2500.00, 1, '', '2025-06-01'),
(17, 4, '2025-09-25', 2500.00, 1, '', '2024-12-31'),
(18, 4, '2025-09-25', 2500.00, 1, '', '2025-01-01'),
(19, 1, '2025-09-25', 2500.00, 1, '', '2025-07-01'),
(20, 1, '2025-09-25', 2500.00, 1, '', '2025-08-01'),
(21, 1, '2025-09-25', 2500.00, 1, '', '2025-09-01'),
(22, 1, '2025-09-25', 2500.00, 1, '', '2025-10-01');

-- --------------------------------------------------------

--
-- Table structure for table `muscle_groups`
--

CREATE TABLE `muscle_groups` (
  `id` int(11) NOT NULL,
  `naziv` varchar(255) NOT NULL,
  `opis` text DEFAULT NULL,
  `ikona` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `muscle_groups`
--

INSERT INTO `muscle_groups` (`id`, `naziv`, `opis`, `ikona`) VALUES
(1, 'Grudi', 'Mišići grudnog koša.', 'URL_do_slike_grudi'),
(2, 'Leđa', 'Mišići leđa, uključujući latisimuse i trapeziuse.', 'URL_do_slike_ledja'),
(3, 'Ramena', 'Deltoidni mišići.', 'URL_do_slike_ramena'),
(4, 'Biceps', 'Mišići prednje strane nadlaktice.', 'URL_do_slike_bicepsa'),
(5, 'Triceps', 'Mišići zadnje strane nadlaktice.', 'URL_do_slike_tricepsa'),
(6, 'Podlaktice', 'Mišići podlaktice.', 'URL_do_slike_podlaktica'),
(7, 'Kvadriceps', 'Mišići prednje strane butine.', 'URL_do_slike_kvadricepsa'),
(8, 'Zadnja loža', 'Mišići zadnje strane butine.', 'URL_do_slike_zadnje_loze'),
(9, 'Gluteus', 'Mišići zadnjice.', 'URL_do_slike_gluteusa'),
(10, 'Listovi', 'Mišići potkolenice.', 'URL_do_slike_listova'),
(11, 'Core', 'Mišići trupa.', 'URL_do_slike_cora');

-- --------------------------------------------------------

--
-- Table structure for table `napredne_mere`
--

CREATE TABLE `napredne_mere` (
  `id` int(11) NOT NULL,
  `athlete_id` int(11) NOT NULL,
  `datum_merenja` date NOT NULL,
  `body_fat_percent` decimal(5,2) DEFAULT NULL,
  `lean_mass_kg` decimal(5,2) DEFAULT NULL,
  `bmr` decimal(6,2) DEFAULT NULL,
  `vo2_max` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `napredne_mere`
--

INSERT INTO `napredne_mere` (`id`, `athlete_id`, `datum_merenja`, `body_fat_percent`, `lean_mass_kg`, `bmr`, `vo2_max`) VALUES
(1, 2, '2025-08-30', NULL, NULL, NULL, NULL),
(2, 3, '2025-08-30', NULL, NULL, NULL, NULL),
(3, 2, '2025-08-20', NULL, NULL, NULL, NULL),
(4, 2, '2025-08-31', 21.40, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `programs`
--

CREATE TABLE `programs` (
  `id` int(11) NOT NULL,
  `naziv` varchar(255) NOT NULL,
  `opis` text DEFAULT NULL,
  `kreirao_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `programs`
--

INSERT INTO `programs` (`id`, `naziv`, `opis`, `kreirao_id`) VALUES
(4, 'Test 1', 'proba', 1),
(5, 'Test 2', 'Testiranje unosa programa', 1);

-- --------------------------------------------------------

--
-- Table structure for table `program_athlete_assignments`
--

CREATE TABLE `program_athlete_assignments` (
  `id` int(11) NOT NULL,
  `program_id` int(11) NOT NULL,
  `athlete_id` int(11) NOT NULL,
  `assigned_by_user_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `program_athlete_assignments`
--

INSERT INTO `program_athlete_assignments` (`id`, `program_id`, `athlete_id`, `assigned_by_user_id`, `assigned_at`) VALUES
(1, 4, 3, 1, '2025-08-17 21:13:32'),
(2, 4, 2, 1, '2025-08-17 21:38:43');

-- --------------------------------------------------------

--
-- Table structure for table `program_group_assignments`
--

CREATE TABLE `program_group_assignments` (
  `id` int(11) NOT NULL,
  `program_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `assigned_by_user_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `program_group_assignments`
--

INSERT INTO `program_group_assignments` (`id`, `program_id`, `group_id`, `assigned_by_user_id`, `assigned_at`) VALUES
(4, 4, 2, 1, '2025-08-17 21:44:28'),
(6, 4, 1, 1, '2025-08-17 21:45:15'),
(7, 5, 1, 1, '2025-09-15 20:21:33');

-- --------------------------------------------------------

--
-- Table structure for table `tests`
--

CREATE TABLE `tests` (
  `id` int(11) NOT NULL,
  `naziv` text NOT NULL,
  `datum` date NOT NULL,
  `trener_id` int(11) DEFAULT NULL,
  `napomena` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `test_exercises`
--

CREATE TABLE `test_exercises` (
  `id` int(11) NOT NULL,
  `test_id` int(11) NOT NULL,
  `exercises_id` int(11) NOT NULL,
  `vrsta_unosa` enum('tezina-vreme','duzina-vreme','vreme-duzina','vreme-ponavljanje','vreme-duzina,ponavljanje','vreme-tezina,ponavljanje','tezina-ponavljanje','ponavljanje','ponavljanje-max') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `test_results`
--

CREATE TABLE `test_results` (
  `id` int(11) NOT NULL,
  `athlete_id` int(11) NOT NULL,
  `test_exercises_id` int(11) NOT NULL,
  `napomena` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `test_results_values`
--

CREATE TABLE `test_results_values` (
  `id` int(11) NOT NULL,
  `test_result_id` int(11) NOT NULL,
  `vrsta_rezultata_1` varchar(50) DEFAULT NULL,
  `rezultat_1` varchar(50) DEFAULT NULL,
  `jedinica_mere_1` varchar(20) DEFAULT NULL,
  `vrsta_rezultata_2` varchar(50) NOT NULL,
  `rezultat_2` varchar(50) NOT NULL,
  `jedinica_mere_2` varchar(20) NOT NULL,
  `vrsta_rezultata_3` varchar(50) NOT NULL,
  `rezultat_3` varchar(50) NOT NULL,
  `jedinica_mere_3` varchar(20) NOT NULL,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `trainers`
--

CREATE TABLE `trainers` (
  `id` int(11) NOT NULL,
  `ime` varchar(255) NOT NULL,
  `prezime` varchar(255) NOT NULL,
  `datum_rodenja` date DEFAULT NULL,
  `adresa_stanovanja` varchar(255) DEFAULT NULL,
  `mesto` varchar(255) DEFAULT NULL,
  `telefon` varchar(50) DEFAULT NULL,
  `mail` varchar(255) DEFAULT NULL,
  `broj_licence` varchar(255) DEFAULT NULL,
  `datum_isticanja` date DEFAULT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `trainers`
--

INSERT INTO `trainers` (`id`, `ime`, `prezime`, `datum_rodenja`, `adresa_stanovanja`, `mesto`, `telefon`, `mail`, `broj_licence`, `datum_isticanja`, `user_id`) VALUES
(4, 'Zoran', 'Kosanović', '1982-11-10', 'Banatska 2v', 'Sombor', '063468077', 'seekness@gmail.com', '1345-24', '2026-05-31', 1),
(6, 'Antonija', 'Nađ Kosanović', '1986-06-07', 'Banatska 2v', 'Sombor', '062266522', NULL, '', '2025-10-10', 7);

-- --------------------------------------------------------

--
-- Table structure for table `trainings`
--

CREATE TABLE `trainings` (
  `id` int(11) NOT NULL,
  `program_id` int(11) NOT NULL,
  `opis` text DEFAULT NULL,
  `datum` date DEFAULT NULL,
  `vreme` time DEFAULT NULL,
  `predicted_duration_minutes` int(11) DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `trainings`
--

INSERT INTO `trainings` (`id`, `program_id`, `opis`, `datum`, `vreme`, `predicted_duration_minutes`, `location_id`) VALUES
(6, 4, 'Dan 1', '2025-07-27', '04:20:00', 45, 2),
(9, 5, 'Trening 1', '2025-09-14', '09:00:04', 90, 1),
(10, 5, 'Veslanje', '2025-09-14', '16:00:00', 75, 1);

-- --------------------------------------------------------

--
-- Table structure for table `training_attendance`
--

CREATE TABLE `training_attendance` (
  `id` int(11) NOT NULL,
  `training_id` int(11) NOT NULL,
  `athlete_id` int(11) NOT NULL,
  `status` enum('prisutan','odsutan','opravdano') NOT NULL,
  `date` date NOT NULL,
  `napomena` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `training_attendance`
--

INSERT INTO `training_attendance` (`id`, `training_id`, `athlete_id`, `status`, `date`, `napomena`, `created_at`) VALUES
(1, 6, 1, 'prisutan', '0000-00-00', '', '2025-08-24 10:57:55'),
(2, 6, 2, 'prisutan', '0000-00-00', '', '2025-08-24 10:57:55'),
(3, 6, 3, 'odsutan', '0000-00-00', '', '2025-08-24 10:57:55'),
(4, 6, 4, 'odsutan', '0000-00-00', '', '2025-09-07 23:59:23');

-- --------------------------------------------------------

--
-- Table structure for table `training_exercises`
--

CREATE TABLE `training_exercises` (
  `id` int(11) NOT NULL,
  `training_id` int(11) NOT NULL,
  `exercise_id` int(11) NOT NULL,
  `broj_serija` int(11) DEFAULT NULL,
  `tezina_kg` varchar(255) DEFAULT NULL,
  `vreme_sekunde` varchar(255) DEFAULT NULL,
  `duzina_metri` varchar(255) DEFAULT NULL,
  `broj_ponavljanja` varchar(255) DEFAULT NULL,
  `rest_duration_seconds` varchar(255) DEFAULT NULL,
  `jacina_izvodjenja` varchar(255) DEFAULT NULL,
  `rest_after_exercise_seconds` int(11) DEFAULT NULL,
  `vrsta_unosa` varchar(50) DEFAULT NULL,
  `superset` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `training_exercises`
--

INSERT INTO `training_exercises` (`id`, `training_id`, `exercise_id`, `broj_serija`, `tezina_kg`, `vreme_sekunde`, `duzina_metri`, `broj_ponavljanja`, `rest_duration_seconds`, `jacina_izvodjenja`, `rest_after_exercise_seconds`, `vrsta_unosa`, `superset`, `sort_order`) VALUES
(30, 6, 2, 5, '80', '0', '0', '120', '60-60-60-60-60', '50-60-70-80-90', 120, 'težina_ponavljanja', 0, 0),
(31, 6, 2, 5, NULL, '60', NULL, NULL, '125', '80-70-60-50-90', 120, 'vreme', 1, 1),
(34, 6, 3, 3, NULL, '45', NULL, NULL, '75', NULL, 120, 'vreme', 0, 2),
(35, 9, 2, 3, '40-50-60', '', '', '10', '90', '100', 120, 'težina_ponavljanja', 0, NULL),
(36, 9, 3, 3, '50-60-70', '45', '', '', '60-75-90', '50-70-90', 120, 'težina_vreme', 0, NULL),
(37, 10, 5, 2, NULL, '120', NULL, NULL, '60', '50-60', 120, 'vreme', 0, 0),
(38, 10, 6, 3, NULL, '30', NULL, NULL, '0', '70', NULL, 'vreme', 0, 1),
(39, 10, 6, 3, NULL, '90', NULL, NULL, '0', '80', NULL, 'vreme', 1, 2),
(40, 10, 6, 3, NULL, '30', NULL, NULL, '120', '90', 240, 'vreme', 1, 3),
(41, 10, 7, 4, NULL, '30', NULL, NULL, '40', '50-70-90-100', 180, 'vreme', 0, 4);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `display_name`, `password`, `role`) VALUES
(1, 'trener', 'Zoran Kosanović', '$2b$10$8kC/eEzsQ5g2tjwMYuggAOINNjJZw99g1O14BsGJBtF/HtT4q0N1S', 'trener'),
(2, 'sportista', 'Sportista Miner', '$2b$10$78bWMOQQQ3vC2Q/inFUyievf4BsWivmzNQ50uJt/6ye3WwLsnnUS2', 'sportista'),
(3, 'amala', 'Mala Antonija', '$2b$10$87fP20csTk.sQEGrs1VVGODa8iCUJDLgJdvY1GAPF/9Trr5lskEjm', 'sportista'),
(4, 'admin', 'ZK', '$2b$10$rR4bPwO7F8rbhxmRwW2rNeRmZMBKSHlHvd45Zey1MGAF0LQoS7Uvu', 'admin'),
(7, 'antonija', 'Antonija Nađ Kosanović', '$2b$10$Xdu0bTK33VD3FJyx2zyHWOMMTSzhqoefwF6yhxtm/9gBon29WFU3q', 'trener'),
(8, 'individual', 'Individual Test', '$2b$10$vPMcSmeOJDSF2YyGKdONN.YVJXgqh7KCWh.5CjMzKOZImAtff9atW', 'individual');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `athletes`
--
ALTER TABLE `athletes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `coach_athlete_assignments`
--
ALTER TABLE `coach_athlete_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `coach_id` (`coach_id`,`athlete_id`),
  ADD KEY `athlete_id` (`athlete_id`);

--
-- Indexes for table `coach_group_assignments`
--
ALTER TABLE `coach_group_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `coach_id` (`coach_id`,`group_id`),
  ADD KEY `group_id` (`group_id`);

--
-- Indexes for table `exercises`
--
ALTER TABLE `exercises`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `naziv` (`naziv`),
  ADD KEY `muscle_group_id` (`muscle_group_id`),
  ADD KEY `exercise_category_id` (`exercise_category_id`),
  ADD KEY `other_muscle_group_id` (`other_muscle_group_id`);

--
-- Indexes for table `exercise_categories`
--
ALTER TABLE `exercise_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `naziv` (`naziv`);

--
-- Indexes for table `fizicke_mere`
--
ALTER TABLE `fizicke_mere`
  ADD PRIMARY KEY (`id`),
  ADD KEY `athlete_id` (`athlete_id`);

--
-- Indexes for table `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `naziv` (`naziv`);

--
-- Indexes for table `group_memberships`
--
ALTER TABLE `group_memberships`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `group_id` (`group_id`,`athlete_id`),
  ADD KEY `athlete_id` (`athlete_id`);

--
-- Indexes for table `individuals`
--
ALTER TABLE `individuals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `naziv` (`naziv`);

--
-- Indexes for table `membership_fees`
--
ALTER TABLE `membership_fees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `membership_payments`
--
ALTER TABLE `membership_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_payment_athlete` (`athlete_id`);

--
-- Indexes for table `muscle_groups`
--
ALTER TABLE `muscle_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `naziv` (`naziv`);

--
-- Indexes for table `napredne_mere`
--
ALTER TABLE `napredne_mere`
  ADD PRIMARY KEY (`id`),
  ADD KEY `athlete_id` (`athlete_id`);

--
-- Indexes for table `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `naziv` (`naziv`);

--
-- Indexes for table `program_athlete_assignments`
--
ALTER TABLE `program_athlete_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `program_id` (`program_id`),
  ADD KEY `athlete_id` (`athlete_id`),
  ADD KEY `assigned_by_user_id` (`assigned_by_user_id`);

--
-- Indexes for table `program_group_assignments`
--
ALTER TABLE `program_group_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `program_id` (`program_id`),
  ADD KEY `group_id` (`group_id`),
  ADD KEY `assigned_by_user_id` (`assigned_by_user_id`);

--
-- Indexes for table `tests`
--
ALTER TABLE `tests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trener_id` (`trener_id`);

--
-- Indexes for table `test_exercises`
--
ALTER TABLE `test_exercises`
  ADD PRIMARY KEY (`id`),
  ADD KEY `test_id` (`test_id`),
  ADD KEY `exercises_id` (`exercises_id`);

--
-- Indexes for table `test_results`
--
ALTER TABLE `test_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `athlete_id` (`athlete_id`),
  ADD KEY `test_exercises_id` (`test_exercises_id`);

--
-- Indexes for table `test_results_values`
--
ALTER TABLE `test_results_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `test_result_id` (`test_result_id`);

--
-- Indexes for table `trainers`
--
ALTER TABLE `trainers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `trainings`
--
ALTER TABLE `trainings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `program_id` (`program_id`),
  ADD KEY `location_id` (`location_id`);

--
-- Indexes for table `training_attendance`
--
ALTER TABLE `training_attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `training_id` (`training_id`,`athlete_id`),
  ADD KEY `athlete_id` (`athlete_id`);

--
-- Indexes for table `training_exercises`
--
ALTER TABLE `training_exercises`
  ADD PRIMARY KEY (`id`),
  ADD KEY `training_id` (`training_id`),
  ADD KEY `exercise_id` (`exercise_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `athletes`
--
ALTER TABLE `athletes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `coach_athlete_assignments`
--
ALTER TABLE `coach_athlete_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `coach_group_assignments`
--
ALTER TABLE `coach_group_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `exercises`
--
ALTER TABLE `exercises`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `exercise_categories`
--
ALTER TABLE `exercise_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `fizicke_mere`
--
ALTER TABLE `fizicke_mere`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `groups`
--
ALTER TABLE `groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `group_memberships`
--
ALTER TABLE `group_memberships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `individuals`
--
ALTER TABLE `individuals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `membership_fees`
--
ALTER TABLE `membership_fees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `membership_payments`
--
ALTER TABLE `membership_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `muscle_groups`
--
ALTER TABLE `muscle_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `napredne_mere`
--
ALTER TABLE `napredne_mere`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `programs`
--
ALTER TABLE `programs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `program_athlete_assignments`
--
ALTER TABLE `program_athlete_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `program_group_assignments`
--
ALTER TABLE `program_group_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tests`
--
ALTER TABLE `tests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `test_exercises`
--
ALTER TABLE `test_exercises`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `test_results`
--
ALTER TABLE `test_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `test_results_values`
--
ALTER TABLE `test_results_values`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trainers`
--
ALTER TABLE `trainers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `trainings`
--
ALTER TABLE `trainings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `training_attendance`
--
ALTER TABLE `training_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `training_exercises`
--
ALTER TABLE `training_exercises`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `athletes`
--
ALTER TABLE `athletes`
  ADD CONSTRAINT `athletes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `coach_athlete_assignments`
--
ALTER TABLE `coach_athlete_assignments`
  ADD CONSTRAINT `coach_athlete_assignments_ibfk_2` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_coach_trainer` FOREIGN KEY (`coach_id`) REFERENCES `trainers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `coach_group_assignments`
--
ALTER TABLE `coach_group_assignments`
  ADD CONSTRAINT `coach_group_assignments_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_group_trainer` FOREIGN KEY (`coach_id`) REFERENCES `trainers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exercises`
--
ALTER TABLE `exercises`
  ADD CONSTRAINT `exercises_ibfk_1` FOREIGN KEY (`muscle_group_id`) REFERENCES `muscle_groups` (`id`),
  ADD CONSTRAINT `exercises_ibfk_2` FOREIGN KEY (`exercise_category_id`) REFERENCES `exercise_categories` (`id`),
  ADD CONSTRAINT `exercises_ibfk_3` FOREIGN KEY (`other_muscle_group_id`) REFERENCES `muscle_groups` (`id`);

--
-- Constraints for table `fizicke_mere`
--
ALTER TABLE `fizicke_mere`
  ADD CONSTRAINT `fizicke_mere_ibfk_1` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `group_memberships`
--
ALTER TABLE `group_memberships`
  ADD CONSTRAINT `group_memberships_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_memberships_ibfk_2` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `individuals`
--
ALTER TABLE `individuals`
  ADD CONSTRAINT `individuals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `membership_payments`
--
ALTER TABLE `membership_payments`
  ADD CONSTRAINT `fk_payment_athlete` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `napredne_mere`
--
ALTER TABLE `napredne_mere`
  ADD CONSTRAINT `napredne_mere_ibfk_1` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `program_athlete_assignments`
--
ALTER TABLE `program_athlete_assignments`
  ADD CONSTRAINT `program_athlete_assignments_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `program_athlete_assignments_ibfk_2` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `program_athlete_assignments_ibfk_3` FOREIGN KEY (`assigned_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `program_group_assignments`
--
ALTER TABLE `program_group_assignments`
  ADD CONSTRAINT `program_group_assignments_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `program_group_assignments_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `program_group_assignments_ibfk_3` FOREIGN KEY (`assigned_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tests`
--
ALTER TABLE `tests`
  ADD CONSTRAINT `tests_ibfk_1` FOREIGN KEY (`trener_id`) REFERENCES `trainers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `test_exercises`
--
ALTER TABLE `test_exercises`
  ADD CONSTRAINT `test_exercises_ibfk_1` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `test_exercises_ibfk_2` FOREIGN KEY (`exercises_id`) REFERENCES `exercises` (`id`);

--
-- Constraints for table `test_results`
--
ALTER TABLE `test_results`
  ADD CONSTRAINT `test_results_ibfk_1` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`),
  ADD CONSTRAINT `test_results_ibfk_2` FOREIGN KEY (`test_exercises_id`) REFERENCES `test_exercises` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `test_results_values`
--
ALTER TABLE `test_results_values`
  ADD CONSTRAINT `test_results_values_ibfk_1` FOREIGN KEY (`test_result_id`) REFERENCES `test_results` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trainers`
--
ALTER TABLE `trainers`
  ADD CONSTRAINT `trainers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trainings`
--
ALTER TABLE `trainings`
  ADD CONSTRAINT `trainings_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trainings_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `training_attendance`
--
ALTER TABLE `training_attendance`
  ADD CONSTRAINT `training_attendance_ibfk_1` FOREIGN KEY (`training_id`) REFERENCES `trainings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `training_attendance_ibfk_2` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `training_exercises`
--
ALTER TABLE `training_exercises`
  ADD CONSTRAINT `training_exercises_ibfk_1` FOREIGN KEY (`training_id`) REFERENCES `trainings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `training_exercises_ibfk_2` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
