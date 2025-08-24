-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 24, 2025 at 11:17 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

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
(2, 'Zoran', 'Kosanović', 'miner', '2007-10-31', '063468056', 2, 'Mile', '1111982110017', NULL, 'Banatska 2v', 'Sombor', 'seekness@gmail.com', 1, 'aaaa', '1916-05-31', 0, '2024-12-31', '2025-08-24 20:03:07'),
(3, 'Antonija', 'Mala', 'amala', '2013-06-01', '00192290201', 3, 'Perica', '1212121212111', NULL, 'Banatska 2v', 'Sombor', 'nesto@hhaa.zu', 1, '', '2025-08-09', 1, '2025-01-01', '2025-08-24 20:03:07'),
(4, 'Ognjen', 'Kosanović', 'ogilic', '2016-07-23', '', NULL, 'Zoran', '2507016111000', NULL, 'Banatska 2v', 'Sombor', '', 1, '', '1899-11-28', 1, '2024-12-30', '2025-08-24 20:03:07');

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
(2, 4, 3, '2025-08-12 15:14:30');

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
(2, 4, 2, '2025-08-23 14:10:35');

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
(2, 'Bench press', '', 1, 'Tegovi', 0, '', '', 2, 5);

-- --------------------------------------------------------

--
-- Table structure for table `exercise_categories`
--

CREATE TABLE `exercise_categories` (
  `id` int(11) NOT NULL,
  `naziv` varchar(255) NOT NULL,
  `opis` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `exercise_categories`
--

INSERT INTO `exercise_categories` (`id`, `naziv`, `opis`) VALUES
(1, 'Veslanje', 'Veslanje na otovrenom'),
(2, 'Teretana', 'Rad na snazi');

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
(2, 'Početna', NULL);

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
(19, 1, 2),
(22, 2, 3);

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
(2, 'Kajak klub - teretana', 'Apatinski put b', 'Sombor'),
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
(1, 3, '2025-08-24', 2500.00, 1, '', '2025-01-01');

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
(4, 'Test 1', 'proba', 1);

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
(6, 4, 1, 1, '2025-08-17 21:45:15');

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
  `mail` varchar(255) NOT NULL,
  `broj_licence` varchar(255) DEFAULT NULL,
  `datum_isticanja` date DEFAULT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `trainers`
--

INSERT INTO `trainers` (`id`, `ime`, `prezime`, `datum_rodenja`, `adresa_stanovanja`, `mesto`, `telefon`, `mail`, `broj_licence`, `datum_isticanja`, `user_id`) VALUES
(4, 'Zoran', 'Kosanović', '1982-11-11', 'Banatska 2v', 'Sombor', '063468056', 'seekness@gmail.com', '1345-24', '2026-05-04', 1);

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
(6, 4, 'Dan 1', '2025-07-27', '04:31:00', 45, 2);

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
(2, 6, 2, 'odsutan', '0000-00-00', 'na kupanju', '2025-08-24 10:57:55'),
(3, 6, 3, 'prisutan', '0000-00-00', '', '2025-08-24 10:57:55');

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
(31, 6, 2, 5, NULL, '60', NULL, NULL, '125', '80', 120, 'vreme', 0, 1);

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
(1, 'seekness', 'Zoran Kosanović', '$2b$10$8kC/eEzsQ5g2tjwMYuggAOINNjJZw99g1O14BsGJBtF/HtT4q0N1S', 'trener'),
(2, 'miner', 'Sportista Miner', '$2b$10$78bWMOQQQ3vC2Q/inFUyievf4BsWivmzNQ50uJt/6ye3WwLsnnUS2', 'sportista'),
(3, 'amala', 'Mala Antonija', '$2b$10$87fP20csTk.sQEGrs1VVGODa8iCUJDLgJdvY1GAPF/9Trr5lskEjm', 'sportista'),
(4, 'zoran1', 'ZK', '$2b$10$rR4bPwO7F8rbhxmRwW2rNeRmZMBKSHlHvd45Zey1MGAF0LQoS7Uvu', 'admin');

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
-- Indexes for table `trainers`
--
ALTER TABLE `trainers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mail` (`mail`),
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `coach_athlete_assignments`
--
ALTER TABLE `coach_athlete_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `coach_group_assignments`
--
ALTER TABLE `coach_group_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `exercises`
--
ALTER TABLE `exercises`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `exercise_categories`
--
ALTER TABLE `exercise_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `groups`
--
ALTER TABLE `groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `group_memberships`
--
ALTER TABLE `group_memberships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `muscle_groups`
--
ALTER TABLE `muscle_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `programs`
--
ALTER TABLE `programs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `program_athlete_assignments`
--
ALTER TABLE `program_athlete_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `program_group_assignments`
--
ALTER TABLE `program_group_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `trainers`
--
ALTER TABLE `trainers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `trainings`
--
ALTER TABLE `trainings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `training_attendance`
--
ALTER TABLE `training_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `training_exercises`
--
ALTER TABLE `training_exercises`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  ADD CONSTRAINT `coach_athlete_assignments_ibfk_1` FOREIGN KEY (`coach_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `coach_athlete_assignments_ibfk_2` FOREIGN KEY (`athlete_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `coach_group_assignments`
--
ALTER TABLE `coach_group_assignments`
  ADD CONSTRAINT `coach_group_assignments_ibfk_1` FOREIGN KEY (`coach_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `coach_group_assignments_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exercises`
--
ALTER TABLE `exercises`
  ADD CONSTRAINT `exercises_ibfk_1` FOREIGN KEY (`muscle_group_id`) REFERENCES `muscle_groups` (`id`),
  ADD CONSTRAINT `exercises_ibfk_2` FOREIGN KEY (`exercise_category_id`) REFERENCES `exercise_categories` (`id`),
  ADD CONSTRAINT `exercises_ibfk_3` FOREIGN KEY (`other_muscle_group_id`) REFERENCES `muscle_groups` (`id`);

--
-- Constraints for table `group_memberships`
--
ALTER TABLE `group_memberships`
  ADD CONSTRAINT `group_memberships_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_memberships_ibfk_2` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `membership_payments`
--
ALTER TABLE `membership_payments`
  ADD CONSTRAINT `fk_payment_athlete` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE;

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
