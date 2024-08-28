package oasis.panels;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.control.Button;
import javafx.scene.control.CheckBox;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Control;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.Slider;
import javafx.scene.control.TextField;
import javafx.scene.control.Tooltip;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;

public class SettingsPanel implements ContentPanel {
    private final VBox content;

    public SettingsPanel() {
        content = new VBox(20);
        content.setPadding(new Insets(20));
        content.setStyle("-fx-background-color: #1E1E1E;");

        Label title = new Label("Settings");
        title.setFont(Font.font("System", FontWeight.BOLD, 24));
        title.setStyle("-fx-text-fill: white;");

        ScrollPane scrollPane = new ScrollPane();
        scrollPane.setStyle("-fx-background: #1E1E1E; -fx-background-color:transparent;");
        scrollPane.setFitToWidth(true);

        VBox settingsContent = new VBox(20);
        settingsContent.getChildren().addAll(
            createAppearanceSettings(),
            createLanguageSettings(),
            createNotificationSettings(),
            createDataSettings(),
            createDataAndDisplayOptions(),
            createPerformanceSettings(),
            createAlertsAndMonitoringSettings()
        );

        scrollPane.setContent(settingsContent);

        HBox buttonBox = createButtonBox();

        content.getChildren().addAll(title, scrollPane, buttonBox);
    }

    private HBox createButtonBox() {
        Button applyButton = new Button("Apply");
        applyButton.setOnAction(e -> applySettings());

        Button saveButton = new Button("Save");
        saveButton.setOnAction(e -> saveSettings());

        HBox buttonBox = new HBox(10, applyButton, saveButton);
        buttonBox.setAlignment(Pos.CENTER_RIGHT);
        buttonBox.setPadding(new Insets(20, 0, 0, 0));

        return buttonBox;
    }

    private void applySettings() {
        // Implement logic to apply settings without saving
        System.out.println("Applying settings...");
    }

    private void saveSettings() {
        // Implement logic to save settings
        System.out.println("Saving settings...");
    }

    private Node createAppearanceSettings() {
        VBox section = createSection("Appearance");

        ComboBox<String> themeComboBox = new ComboBox<>();
        themeComboBox.getItems().addAll("Dark Theme", "Light Theme", "System Default");
        themeComboBox.setValue("Dark Theme");
        addTooltip(themeComboBox, "Select the color theme for the application");

        Slider fontSizeSlider = new Slider(8, 24, 14);
        fontSizeSlider.setShowTickLabels(true);
        fontSizeSlider.setShowTickMarks(true);
        fontSizeSlider.setMajorTickUnit(4);
        fontSizeSlider.setMinorTickCount(3);
        addTooltip(fontSizeSlider, "Adjust the font size throughout the application");

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.addRow(0, new Label("Theme:"), themeComboBox);
        grid.addRow(1, new Label("Font Size:"), fontSizeSlider);

        section.getChildren().add(grid);
        return section;
    }

    private Node createLanguageSettings() {
        VBox section = createSection("Language");

        ComboBox<String> languageComboBox = new ComboBox<>();
        languageComboBox.getItems().addAll("English", "Spanish", "French", "German", "Chinese");
        languageComboBox.setValue("English");
        addTooltip(languageComboBox, "Select the language for the application interface");

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.addRow(0, new Label("Language:"), languageComboBox);

        section.getChildren().add(grid);
        return section;
    }

    private Node createNotificationSettings() {
        VBox section = createSection("Notifications");

        CheckBox enableNotifications = new CheckBox("Enable Notifications");
        enableNotifications.setSelected(true);
        addTooltip(enableNotifications, "Toggle all notifications on or off");

        CheckBox soundNotifications = new CheckBox("Enable Sound");
        soundNotifications.setSelected(true);
        addTooltip(soundNotifications, "Enable or disable sound for notifications");

        VBox checkBoxes = new VBox(10, enableNotifications, soundNotifications);
        section.getChildren().add(checkBoxes);

        return section;
    }

    private Node createDataSettings() {
        VBox section = createSection("Data Management");

        Button clearCacheButton = new Button("Clear Cache");
        clearCacheButton.setOnAction(e -> {
            // Implement cache clearing logic
            System.out.println("Cache cleared");
        });
        addTooltip(clearCacheButton, "Remove all temporary data stored by the application");

        Button exportDataButton = new Button("Export Data");
        exportDataButton.setOnAction(e -> {
            // Implement data export logic
            System.out.println("Data exported");
        });
        addTooltip(exportDataButton, "Export all user data to a file");

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.addRow(0, clearCacheButton, exportDataButton);

        section.getChildren().add(grid);
        return section;
    }

    private Node createDataAndDisplayOptions() {
        VBox section = createSection("Data and Display Options");

        ComboBox<String> unitsComboBox = new ComboBox<>();
        unitsComboBox.getItems().addAll("Metric", "Imperial");
        unitsComboBox.setValue("Metric");
        addTooltip(unitsComboBox, "Choose the system of measurement for displayed values");

        ComboBox<String> dateFormatComboBox = new ComboBox<>();
        dateFormatComboBox.getItems().addAll("DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD");
        dateFormatComboBox.setValue("YYYY-MM-DD");
        addTooltip(dateFormatComboBox, "Select the format for displaying dates");

        ComboBox<String> coordinateSystemComboBox = new ComboBox<>();
        coordinateSystemComboBox.getItems().addAll("Celestial", "Ecliptic", "Galactic");
        coordinateSystemComboBox.setValue("Celestial");
        addTooltip(coordinateSystemComboBox, "Choose the default coordinate system for space object positions");

        ComboBox<String> mapProjectionComboBox = new ComboBox<>();
        mapProjectionComboBox.getItems().addAll("Mercator", "Mollweide", "Aitoff");
        mapProjectionComboBox.setValue("Mercator");
        addTooltip(mapProjectionComboBox, "Select the default projection for space maps");

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.addRow(0, new Label("Units of Measurement:"), unitsComboBox);
        grid.addRow(1, new Label("Date Format:"), dateFormatComboBox);
        grid.addRow(2, new Label("Coordinate System:"), coordinateSystemComboBox);
        grid.addRow(3, new Label("Default Map Projection:"), mapProjectionComboBox);

        section.getChildren().add(grid);
        return section;
    }

    private Node createPerformanceSettings() {
        VBox section = createSection("Performance Settings");

        CheckBox hardwareAcceleration = new CheckBox("Enable Hardware Acceleration");
        hardwareAcceleration.setSelected(true);
        addTooltip(hardwareAcceleration, "Use GPU acceleration for improved performance (may require restart)");

        ComboBox<String> renderingQualityComboBox = new ComboBox<>();
        renderingQualityComboBox.getItems().addAll("Low", "Medium", "High", "Ultra");
        renderingQualityComboBox.setValue("Medium");
        addTooltip(renderingQualityComboBox, "Set the quality of 3D renderings (higher quality may impact performance)");

        Slider updateFrequencySlider = new Slider(1, 60, 30);
        updateFrequencySlider.setShowTickLabels(true);
        updateFrequencySlider.setShowTickMarks(true);
        updateFrequencySlider.setMajorTickUnit(10);
        updateFrequencySlider.setMinorTickCount(9);
        addTooltip(updateFrequencySlider, "Set how often the application updates real-time data (in updates per minute)");

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.addRow(0, hardwareAcceleration);
        grid.addRow(1, new Label("3D Rendering Quality:"), renderingQualityComboBox);
        grid.addRow(2, new Label("Update Frequency (per minute):"), updateFrequencySlider);

        section.getChildren().add(grid);
        return section;
    }

    private Node createAlertsAndMonitoringSettings() {
        VBox section = createSection("Alerts and Monitoring");

        TextField solarFlareThreshold = new TextField();
        solarFlareThreshold.setPromptText("e.g., X1.0");
        addTooltip(solarFlareThreshold, "Set the minimum solar flare class to trigger an alert");

        CheckBox emailAlerts = new CheckBox("Email Alerts");
        addTooltip(emailAlerts, "Receive alerts via email");

        CheckBox pushNotifications = new CheckBox("Push Notifications");
        addTooltip(pushNotifications, "Receive alerts as push notifications");

        CheckBox smsAlerts = new CheckBox("SMS Alerts");
        addTooltip(smsAlerts, "Receive alerts via SMS");

        ComboBox<String> monitoredRegionComboBox = new ComboBox<>();
        monitoredRegionComboBox.getItems().addAll("Low Earth Orbit", "Geosynchronous Orbit", "Lunar Orbit", "Deep Space");
        monitoredRegionComboBox.setValue("Low Earth Orbit");
        addTooltip(monitoredRegionComboBox, "Select the primary region of space to monitor");

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.addRow(0, new Label("Solar Flare Alert Threshold:"), solarFlareThreshold);
        grid.addRow(1, new Label("Alert Methods:"), new VBox(5, emailAlerts, pushNotifications, smsAlerts));
        grid.addRow(2, new Label("Monitored Region:"), monitoredRegionComboBox);

        section.getChildren().add(grid);
        return section;
    }

    private VBox createSection(String title) {
        VBox section = new VBox(10);
        section.setStyle("-fx-background-color: #2E2E2E; -fx-padding: 10; -fx-background-radius: 5;");

        Label sectionTitle = new Label(title);
        sectionTitle.setFont(Font.font("System", FontWeight.BOLD, 18));
        sectionTitle.setStyle("-fx-text-fill: white;");

        section.getChildren().add(sectionTitle);
        return section;
    }

    private void addTooltip(Control control, String text) {
        Tooltip tooltip = new Tooltip(text);
        tooltip.setFont(Font.font("System", 12));
        control.setTooltip(tooltip);
    }

    @Override
    public Node getContent() {
        return content;
    }

    @Override
    public void updateContent() {
        // Implement any logic to update the settings content
    }
}