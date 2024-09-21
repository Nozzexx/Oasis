package oasis.panels;

import javafx.scene.Node;

public interface ContentPanel {
    Node getContent();
    void updateContent();
}