package oasis.panels;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.control.Label;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.shape.Rectangle;

public class DashboardPanel implements ContentPanel {
    private final VBox content;
    private final GridPane metricsGrid;
    private final HBox statusOverview;

    public DashboardPanel() {
        content = new VBox(20);
        content.setPadding(new Insets(20));

        // Title
        Label titleLabel = new Label("Mission Control Dashboard");
        titleLabel.setStyle("-fx-font-size: 28px; -fx-font-weight: bold; -fx-text-fill: white;");
        content.getChildren().add(titleLabel);

        // Key Metrics
        metricsGrid = createMetricsGrid();
        content.getChildren().add(metricsGrid);

        // Status Overview
        statusOverview = createStatusOverview();
        content.getChildren().add(statusOverview);

        // Charts Placeholder
        VBox chartsPlaceholder = createChartsPlaceholder();
        content.getChildren().add(chartsPlaceholder);

        // Set the background color for the entire dashboard
        content.setStyle("-fx-background-color: #2C3E50;");
    }

    private GridPane createMetricsGrid() {
        GridPane grid = new GridPane();
        grid.setHgap(20);
        grid.setVgap(20);
        grid.setPadding(new Insets(10));
        grid.setStyle("-fx-background-color: #34495E; -fx-background-radius: 10;");

        addMetric(grid, 0, 0, "Active Satellites", "142");
        addMetric(grid, 1, 0, "Orbits Monitored", "37");
        addMetric(grid, 0, 1, "Debris Tracked", "27,531");
        addMetric(grid, 1, 1, "Collision Risks", "3");

        return grid;
    }

    private void addMetric(GridPane grid, int col, int row, String label, String value) {
        VBox metricBox = new VBox(5);
        metricBox.setAlignment(Pos.CENTER);

        Label metricLabel = new Label(label);
        metricLabel.setStyle("-fx-font-size: 14px; -fx-text-fill: #BDC3C7;");

        Label metricValue = new Label(value);
        metricValue.setStyle("-fx-font-size: 24px; -fx-font-weight: bold; -fx-text-fill: white;");

        metricBox.getChildren().addAll(metricLabel, metricValue);
        grid.add(metricBox, col, row);
    }

    private HBox createStatusOverview() {
        HBox statusBox = new HBox(20);
        statusBox.setAlignment(Pos.CENTER_LEFT);
        statusBox.setPadding(new Insets(10));
        statusBox.setStyle("-fx-background-color: #34495E; -fx-background-radius: 10;");

        addStatusIndicator(statusBox, "System Status", Color.GREEN);
        addStatusIndicator(statusBox, "Network", Color.GREEN);
        addStatusIndicator(statusBox, "Data Feed", Color.YELLOW);
        addStatusIndicator(statusBox, "Ground Stations", Color.GREEN);

        return statusBox;
    }

    private void addStatusIndicator(HBox container, String label, Color color) {
        VBox indicatorBox = new VBox(5);
        indicatorBox.setAlignment(Pos.CENTER);

        Rectangle indicator = new Rectangle(15, 15);
        indicator.setFill(color);

        Label statusLabel = new Label(label);
        statusLabel.setStyle("-fx-font-size: 14px; -fx-text-fill: white;");

        indicatorBox.getChildren().addAll(indicator, statusLabel);
        container.getChildren().add(indicatorBox);
    }

    private VBox createChartsPlaceholder() {
        VBox chartsBox = new VBox(20);
        chartsBox.setAlignment(Pos.CENTER);
        chartsBox.setPadding(new Insets(20));
        chartsBox.setStyle("-fx-background-color: #34495E; -fx-background-radius: 10;");

        Label chartTitle = new Label("Orbital Traffic Analysis");
        chartTitle.setStyle("-fx-font-size: 18px; -fx-font-weight: bold; -fx-text-fill: white;");

        Rectangle chartPlaceholder = new Rectangle(400, 200);
        chartPlaceholder.setFill(Color.TRANSPARENT);
        chartPlaceholder.setStroke(Color.WHITE);
        chartPlaceholder.setStrokeWidth(2);

        Label placeholderText = new Label("Chart Placeholder");
        placeholderText.setStyle("-fx-font-size: 16px; -fx-text-fill: #BDC3C7;");

        VBox.setVgrow(chartPlaceholder, Priority.ALWAYS);
        chartsBox.getChildren().addAll(chartTitle, chartPlaceholder, placeholderText);

        return chartsBox;
    }

    @Override
    public Node getContent() {
        return content;
    }

    @Override
    public void updateContent() {
        // Implement logic to update dashboard content
        // For example, refreshing metrics or status indicators
    }
}